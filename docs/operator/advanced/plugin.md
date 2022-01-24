
# Add your own plugin

#### Extend the framework in any direction

---

A plugin is a separate module of code that can literally plug into the framework to extend the core
functionality. Popular examples of plugins are new UI components, dashboards, and new ways
of reporting information or displaying data.

### Beware of untrusted plugins

---

Because plugins are arbitrary HTML files, you should never upload a plugin from someone you do
not trust, unless you have personally read and understood the code.

### Create your own plugin

---

You can write your own custom plugin easily. Plugins must be HTML files, which can contain JavaScript (jQuery
and NodeJS supported) and CSS blocks. When you upload a plugin, it is stored in your workspace. You can view
open-source plugins in the [Community](https://github.com/preludeorg/community) repository. Plugins can leverage 
the internal REST API or message bus to interact with the core system. They are also able to use the available internal functions outlined below.

### Available internal functions

---

- Basic.exists(file)
- Basic.createStorage([directories])
- Basic.normalizePath(file)
- Basic.storeData(contents, path)
- Basic.loadData(path)
- Basic.loadYaml(path)
- Basic.deleteData(path)
- Basic.deleteDir(directory)
- Basic.recursiveFiles(directory)
- Basic.uuidv4()
- Basic.isUUID(string)
- Basic.bin2string([bytes])
- Basic.deepCopy(object)
- Basic.constructEndpoint(endpoint, parameters)
- Basic.nullValues(array)
- Requests.fetchOperator(endpoint, parameters)
- Requests.fetchGatekeeper(endpoint, parameters)

### Internal message bus

---

Here are the states which are currently supported:

- **loaded**: Emitted when the app has finished loading and mounted all initial DOM elements.
- **attack:update**: Emitted when TTPs inside the global ATTACK database have been updated.
- **instruction:resolved**: Emitted when an Instruction finishes executing
- **training:challenge**: Used to deploy a training sidebar. (ie: Events.bus.emit('training:challenge', {program: program_id, course: course_id, challenge: challenge_id}))
- **training:flags**: Used to show training flag navigation for specific section (ie: Events.bus.emit('training:flags', 'docs'))
- **publish:PUBLISHER_TYPE**: Emitted when pushing links to be published by a specific PUBLISHER_TYPE
- **redirector:destroy**: Emitted when the user has selected to destroy a redirector
- **redirector:destroyed**: Emitted when a redirector has been successfully destroyed
- **navigation:mount**: Used to mount a navigation link in the left sidebar (ie: Events.bus.emit('navigation:mount', name, label, iconDOMElement, renderFunction))
- **navigation:unmount**: Used to unmount a navigation link from the left sidebar (ie: Events.bus.emit('navigation:unmount', name))
- **navigation:enter**: Emitted when a section has been entered
- **section:dock**: Emitted when a dock bar has been built inside of a section
- **section:dock:query**: Used to trigger the emission of a section:dock event for the current page
- **section:dock:rebuild**: Used to rebuild the dock inside the current page by modifying the elements received in the section:dock event

### Examples

#### Example: React to a triggered event

```javascript
Events.bus.on('attack:update', () => {
    console.log('Do something when this event is triggered')
});
```
    
   
#### Example: Trigger a new event for listeners

```javascript
Events.bus.emit('attack:indexed');
```
    
   
#### Example: Deregister a listening event

```javascript
Events.bus.listeners('attack:update').map(listener => {
    if (listener.EDITOR) {
        Events.bus.off('attack:update', listener);
    }
});
```
    
### Hello world plugin

---

#### Example: Save this plugin as hello.html and import it from the plugins section

```html
<div class="profile-heading-container">
    <div class="body">
        <strong class="profile-heading">Hello world!</strong>
    </div>
</div>
<script>
    alert('Hello world!')    
</script>
```
    
