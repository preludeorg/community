const PLUGIN_NAME = 'Vectr';

let vectr;
let orgId;
let baseAssessment;
let operationsToCampaign = {};

const getOrganizationIdByName = (name) => {
    const query = `query {
      organizations(filter: {name: {eq: \"${name}\"}}) {
        nodes { id, name }
      }
    }`;
    return fetchVectr({body: JSON.stringify({query: query})});
}

const getAssessmentByName = (name) => {
    const query = `query {
      assessments(db: \"${vectr.database}\", filter: {name: {eq: \"${name}\"}}) {
        nodes { id, name, description, campaigns{id, description}, tags{id}, offset, createTime, updateTime }
      }
    }`;
    return fetchVectr({body: JSON.stringify({query: query})});
}

const getCampaignsByIds = (campaignIds) => {
    const query = `query CampaignsByIds($ids: [String]!) {
      campaignsByIds(db: \"${vectr.database}\", ids: $ids) {
        nodes {
          id, name, description
        }
      }
    }`;
    return fetchVectr({body: JSON.stringify({query: query, variables: {ids: campaignIds}})});
}

const createAssessment = (name, org_id) => {
    const query = `mutation ($input: CreateAssessmentInput!) {
      assessment {
        create(input: $input) {
          assessments {
             id, name, description, tags{id}, offset, createTime, updateTime
          }
        }
      }
    }`;
    const variables = {input: {db: vectr.database, assessmentData:[{name: name, organizationIds:[org_id]}]}};
    return fetchVectr({body: JSON.stringify({query: query, variables: variables})});
}

const createCampaign = (campaign_name, operation_id, parent_assessment_id, org_id) => {
    const query = `mutation ($input: CreateCampaignInput!) {
      campaign {
        create(input: $input) {
          campaigns {
            id, name, description, createTime
          }
        }
      }
    }`;
    const variables = {input: {db: vectr.database, assessmentId: parent_assessment_id,
            campaignData: [{name: campaign_name, description: operation_id, organizationIds: [org_id]}]}};
    return fetchVectr({body: JSON.stringify({query: query, variables: variables})});
}

const  createTestCase = (link, ttp, campaignId) => {
    const query = `mutation ($input: CreateTestCaseAndTemplateMatchByNameInput!) {
      testCase {
        createWithTemplateMatchByName(input: $input) {
          testCases {
            id, name
          }
        }
      }
    }`;
    const testCase = {name: ttp.name, description: ttp.description, phase: normalizePhase(ttp.tactic), technique: link.technique,
        tags: [link.tag, link.host, link.platform, link.executor], organization: vectr.org_name, status: "COMPLETED", outcome: "TBD",
        outcomeNotes: link.response, redTools: [{name: 'Operator', vendor: 'Prelude'}], operatorGuidance: link.request,
        attackStart: link.timestamp, attackStop: link.timestamp};
    const variables = {input: {db: vectr.database, campaignId: campaignId, createTestCaseInputs: [{testCaseData: testCase}]}}
    return fetchVectr({body: JSON.stringify({query: query, variables: variables})});
}

const fetchVectr = (params) => {
    return new Promise(((resolve, reject) => {
        fetch(`${vectr.url}/sra-purpletools-rest/graphql`, {
            agent: Requests.insecure,
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `VEC1 ${vectr.key_id}:${vectr.secret_key}`
            },
            ...params
        })
            .then(res => res.json())
            .then(res => resolve(res))
            .catch(err => reject(err))
    }));
}

const normalizePhase = (tactic) => {
    const tactics = {
        'resource-development': 'Resource Development',
        'initial-access': 'Initial Access',
        'defense-evasion': 'Defense Evasion',
        'command-and-control': 'Command & Control',
        'discovery': 'Discovery',
        'collection': 'Collection',
        'persistence': 'Persistence',
        'credential-access': 'Credential Access',
        'privilege-escalation': 'Privilege Escalation',
        'lateral-movement': 'Lateral Movement',
        'execution': 'Execution',
        'exfiltration': 'Exfiltration',
        'impact': 'Impact'
    }
    return tactics[tactic];
}

let PUBLISH_CAMPAIGN_LOCK = Promise.resolve(true);
const publishCampaign = (operation) => {
    return PUBLISH_CAMPAIGN_LOCK = PUBLISH_CAMPAIGN_LOCK.then(() => new Promise((resolve, reject) => {
        if(operationsToCampaign.hasOwnProperty(operation)) {
            resolve(operationsToCampaign[operation]);
        } else {
            createCampaign(vectr.campaign === 'automatic' ? `Prelude Operation - ${new Date().toLocaleString()}` : operation, operation, baseAssessment.id, orgId)
                .then(res => {
                    operationsToCampaign[operation] = res.data.campaign.create.campaigns[0].id;
                    resolve(operationsToCampaign[operation]);
                });
        }
    }));
}

let PUBLISH_LINK_LOCK = Promise.resolve(true);
const publishLinkData = (link, campaignId) => {
    return PUBLISH_LINK_LOCK = PUBLISH_LINK_LOCK.then(() => new Promise((resolve, reject) => {
        Requests.fetchOperator(`/v1/ttps/${link.ttp}`)
            .then(res => res.json())
            .then(ttp => {
                createTestCase(link, ttp, campaignId).then(resolve).catch((err) => console.log(err))
            });
    }));
}

const publishLink = (link) => {
    publishCampaign(vectr.campaign === 'automatic' ? link.operation : vectr.campaign)
        .then(campaignId => {
            publishLinkData(link, campaignId)
        });
}

const initializeOperationCampaignMap = () => {
    return new Promise((resolve, reject) => {
        getCampaignsByIds(baseAssessment.campaigns.map(c => c.id))
            .then(res => {
                let campaigns = {};
                res.data.campaignsByIds.nodes.forEach((campaign) => {
                    campaigns[campaign.description] = campaign.id;
                });
                resolve(campaigns);
            });
    });
}

const initializeVectrAssessment = () => {
    return new Promise((resolve, reject) => {
        getOrganizationIdByName(vectr.org_name)
            .then(res => {
                if (res.data.organizations.nodes.length === 0) {
                    reject(`Organization '${vectr.org_name}' cannot be found in Vectr! Initialization failed.`);
                } else {
                    orgId = res.data.organizations.nodes[0].id;
                    getAssessmentByName('Prelude Assessment')
                        .then(res => {
                            if (res.data.assessments.nodes.length !== 0) {
                                resolve(res.data.assessments.nodes[0]);
                            } else {
                                createAssessment('Prelude Assessment', orgId)
                                    .then(res => {
                                        resolve({...res.data.assessment.create.assessments[0], ...{campaigns:[]}});
                                    });
                            }
                        });
                }
        });
    });
}

const removeConnection = () => {
    return Requests.fetchOperator('/v1/settings', {method: 'GET'}).then(res => res.json()).then(settings => {
        const publishers = settings.publishers;
        delete publishers.vectr;
        return Requests.fetchOperator('/v1/settings', {method: 'PUT', body: JSON.stringify({
            publishers: publishers
        })}).then(() => {
            Events.bus.removeAllListeners('publish:vectr');
        });
    });
};

const configureConnection = (config) => {
    Events.bus.removeAllListeners('publish:vectr');
    vectr = config;
    if (vectr?.url && vectr?.database && vectr?.org_name && vectr?.key_id && vectr?.secret_key && vectr?.campaign) {
        initializeVectrAssessment()
            .then(assessment => {
                baseAssessment = assessment;
                initializeOperationCampaignMap()
                    .then(campaignMap => {
                        operationsToCampaign = campaignMap;
                        Events.bus.on('publish:vectr', (link) => {
                            publishLink(link);
                        });
                    })
            })
            .catch(err => {
                Events.bus.emit('chat:message', err);
                removeConnection();
            });
    }
}

const saveConnection = (config) => {
    return Requests.fetchOperator(`/v1/plugin/${PLUGIN_NAME}`, {method: 'POST', body: JSON.stringify(config)}).then(res => res.json()).then(config => {
        return Requests.fetchOperator('/v1/settings', {method: 'GET'}).then(res => res.json()).then(settings => {
            return Requests.fetchOperator('/v1/settings', {method: 'PUT', body: JSON.stringify({
                publishers: { ...settings.publishers, vectr: {enabled: true} }
            })}).then(() => {
                Events.bus.emit('chat:message', 'Connection details saved');
                configureConnection(config);
            });
        });
    });
};

const cleanupListeners = (topics) => {
    topics.map(topic => Events.bus.listeners(topic).map(listener => {
        if (listener[`${PLUGIN_NAME}_LISTENER`]) {
            Events.bus.off(topic, listener);
        }
    }));
};

cleanupListeners(['plugin:config', 'plugin:delete']);

Events.bus.on('plugin:config', Object.assign((name, config) => {
    if (name === PLUGIN_NAME) {
        saveConnection(config);
    }
}, {[`${PLUGIN_NAME}_LISTENER`]: true}));

Events.bus.on('plugin:delete', Object.assign((name) => {
    if (name === PLUGIN_NAME) {
        removeConnection();
        cleanupListeners(['plugin:config', 'plugin:delete']);
    }
}, {[`${PLUGIN_NAME}_LISTENER`]: true}));


Requests.fetchOperator(`/v1/plugin/${PLUGIN_NAME}`, {method: 'GET'})
    .then(res => res.json()).then(config => {
        if (config?.url && config?.database && config?.org_name && config?.key_id && config?.secret_key && config?.campaign) {
            saveConnection(config);
        } else {
            removeConnection();
        }
    });