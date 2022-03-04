
# VECTR publisher plugin

### What is VECTR?

---

VECTR ([Github](https://github.com/SecurityRiskAdvisors/VECTR)) is a tool that facilitates tracking of your red and blue team testing activities to measure detection and prevention capabilities across different attack scenarios.

### What does the VECTR plugin do?

---

The VECTR plugin will automatically send your executed TTP data to VECTR in real-time. A top-level Prelude Assessment is created in VECTR, then campaigns are configured in one of 2 ways depending upon how you configure the campaign value. If the campaign field is left blank or set to the default "automatic" value, every click of the `Deploy` button in Operator will create a new timestamped campaign in VECTR. If the campaign value is manually specified, then TTP data will append to that specific campaign.

### Configuring the plugin

---
 
First, go the setting and click on Vectr plugin to install it. Configure the following mandatory values based upon the example below:

- url: https://sravectr.internal:8081
- database: PURPLE_DEMO_CE
- org_name: MITRE
- key_id: OSDZXU77OZSB8DXEAQK4VG
- secret_key: Rl5i3b0gdhPgu/4+Ooa+MofmvWwFRyOfAGwrqEayWk8=

Configure the optional campaign field. If the campaign value is manually specified, then TTP data will append to that specific campaign. Otherwise, Operator will generate a new campaign automatically for each `Deploy`:

- campaign: automatic