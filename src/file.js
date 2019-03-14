import _path from "path";
import _fs from "fs";
import check from "check-types";
import {configy} from "./configy";
import Node from "./node";

/**
 * Allowed description aliases
 * @type {string[]}
 */
export const properties = [
    "required",
    "type",
    "default",
    "allowed",
    "static"
];

/**
 * Allowed types
 * @type {string[]}
 */
export const types = [ // TODO: reorder for performance
    "string",
    "number",
    "integer",
    "boolean",
    "array",
    "object"
];

function iterateObject(obj, callback, history = '') {
    let node = true;
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const o = obj[key];
            if (check.nonEmptyObject(o)) {
                o.history = history + '.' + key;
                o.key = key;
                node = false;
                // Shorten root object's "." in the front of the string
                if (o.history.charAt(0) === '.') {
                    o.history = o.history.substring(1);
                }
                o.node = File.iterateObject(o, callback, o.history);
                callback(o, obj);
            }
        }
    }
    return node;
}

/**
 * Represents a configuration file
 */
export class File {
    
    constructor(path, config) {
        this.path = _path.join(configy.directory, path);
        try {
            this.description = require(this.path);
        } catch (error) {
            throw new Error("Invalid path");
        }
        this.history = {};
        this.build();
        if (config) {
            this.config = _path.join(configy.directory, config);
        } else {
            this.config = this.path.split('.')[0] + ".json";
        }
        //this.load();
        console.log(JSON.stringify(this.getConfig(), null, 2))
    }
    
    build() {
        // TODO: Streamline error messages
        // TODO: Add node recognition
        
        const tree = {};
        
        const layer = (obj, tree, callback, trace) => {
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const o = obj[key];
                    const t = tree[key] = null;
                    if (check.nonEmptyObject(o)) {
                        callback(o, t, tree);
                        layer(o, t, callback, trace ? trace + '.' + key : key);
                    }
                }
            }
        };
        
        layer(this.description, tree, (object, tree) => {
            const {} = object;
            tree = new Node({}, );
            for (let key in object) {
                if (object.hasOwnProperty(key)) {
                    properties.forEach(property => {
                        if (key === property) {
                            
                        }
                    });
                }
            }
        });
        
        this.tree = tree;
        
        
        
        
        
        
        this.iterateTree((node, parent) => {
            let {required, type, "default": _default, allowed, "static": _static} = node;
            
            if (required) {
                if (check.not.boolean(required)) {
                    throw new Error('Property "required" must be a boolean value');
                } else {
                    if (check.undefined(_default)) {
                        throw new Error(`Property "required" requires a default value`)
                    }
                }
            }
            
            if (type) {
                type = type.toLowerCase();
                
                if (check.not.string(type)) {
                    throw new Error('Property "type" must be of type string');
                } else {
                    let isValid = false;
                    for (let t of types) {
                        if (type === t) {
                            isValid = true;
                            break;
                        }
                    }
                    if (!isValid) {
                        throw new Error('Unknown type "' + type + '"');
                    }
                }
            }
    
            if (_default) {
                if (type && !check[type](_default)) {
                    throw new Error(`Property "default" on node "${node.key}": Type ${type} does not match value ${_default}`);
                } else {
                    node.value = _default;
                }
            }
    
            if (allowed) {
                if (check.array(allowed)) {
                    // TODO: Is default allowed?
                    // TODO: Are alloweds of correct type?
                } else {
                    throw new Error("Property allowed must be an array of values");
                }
            }
    
            if (_static) {
                if (check.not.undefined(allowed)) {
                    throw new Error(`Property "static" on node ${node.key}: Property "allowed" is not allowed with property "static"`);
                }
            }
    
            // Register history
            this.history[node.history] = node;
        })
    }
    
    verify(force) {
        this.iterateTree(o => {
            
            if (o['required']) {
                if (check.assigned(o.value))
                    throw new Error("Field is required");
            }
            
            if (o['type'] && check.nonEmptyString(o.type)) {
                switch (o.type.toLowerCase()) {
                    case 'string':
                        if (check.not.string(o.value))
                            throw new Error("Value is not of type String");
                        break;
                    case 'number':
                        if (check.not.number(o.value))
                            throw new Error("Value is not of type Number");
                        break;
                    case 'boolean':
                        if (check.not.boolean(o.value))
                            throw new Error("Value is not of type Boolean");
                        break;
                    //case 'null': //case 'undefined':
                    default:
                        throw new Error("Type defined in default is not supported");
                }
            }
            
            if (o['default']) {
            
            }
            
            if (o['allowed']) {
                if (check.nonEmptyArray(o.allowed)) {
                    // If allowed is an array, loop through it and check if value is none of them.
                    if (o.every(a => check.not.equal(a, o.value)))
                        throw new Error("Value: " + o.value + " is not allowed");
                } else {
                    throw new Error("The property 'allowed' should be an Array. If you are looking for a default, required and static/final value use 'static' instead");
                }
            }
            
            if (o['static']) {
                if (check.not.equal(o.default, o.value)) {
                    throw new Error("Value does not match Default on property defined as static");
                }
            }
        });
    }
    
    iterateTree(callback) {
        for (let key in this.history) {
            if (this.history.hasOwnProperty(key)) {
                callback(this.history[key])
            }
        }
    }
    
    get(history) {
        return this.history[history];
    }
    
    set(history, value) {
        this.history[history].value = value;
    }
    
    load() {
        _fs.exists(this.config, (exists) => {
            if (exists) {
                _fs.readFile(this.config, (err, data) => {
                    const config = JSON.parse(data);
                    this.iterateTree(o => {
                        let value = File.getProperty(o.history, config);
                        //console.log(value)
                        if (value) {
                            o.value = value;
                        } else {
                            if (o.default && o.required) {
                                o.value = o.default
                            }
                        }
                    });
                })
            } else {
                console.error("Config file does not exist. Creating new one");
                this.restoreDefault();
                //console.log(this.tree)
            }
        })
    }
    
    save() {
        _fs.writeFile(this.config, JSON.stringify(this.getConfig(), null, 2),
            (err) => {
                if (err) {
                    throw new Error("Could not save Config to " + this.config);
                }
            }
        );
    }
    
    getConfig() {
        const config = {};
        this.iterateTree(node => {
            const keys = node.history.split('.');
            let obj = config;
            for (let key of keys.slice(0, keys.length-1)) {
                if (check.not.object(obj[key])) {
                    obj[key] = {};
                }
                obj = obj[key];
            }
            obj[keys[keys.length-1]] = node.value;
        });
        return config;
    }
    
    restoreDefault() {
        this.iterateTree(o => {
            if (o.default) {
                o.value = o.default;
            } else {
                delete o.value;
            }
        })
    }
}
