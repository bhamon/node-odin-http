'use strict';

let lib = {
	deps:{
		joi:require('joi')
	},
	odin:{
		util:require('odin').util
	}
};

let SYMBOL_MEMBER_TREE = Symbol('tree');
let SYMBOL_METHOD_WALK = Symbol('walk');
let SYMBOL_WILDCARD = Symbol('*');
let VALIDATOR_RIGHT_WILDCARD = lib.deps.joi.string().regex(/^\*|([a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*(\.\*)?)$/);
let VALIDATOR_RIGHT = lib.deps.joi.string().regex(/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*$/);
let WILDCARD = '*';
let SEPARATOR = '.';

/**
	@class
	@classdesc		Rights tree.
	@alias			module:odin/http.RightsTree
	@example
		let rt = new RightsTree();

		rt.add('sessions');					// Adds [sessions => *].
		rt.add('profile.view');				// Adds [profile => view => *].
		rt.add('profile.*');				// Expands [profile => view => *] to [profile => *].
		rt.add('profile.edit');				// Doesn't change anything.
		rt.add('users.*');					// Adds [users => *].
		rt.add('admin.users.*');			// Adds [admin => users => *].

		rt[Symbol.iterator]
			// sessions.*
			// profile.*
			// users.*
			// admin.users.*

		rt.has('users');					// Looks for [*] then [users => *] ; Returns true for [users => *].
		rt.has('users.list')				// Looks for [*] then [users => *] then [users => list => *] ; Returns true for [users => *].
		rt.has('admin.sessions.remove')		// Looks for [*] then [admin => *] then [admin => sessions => *] then [admin => sessions => remove] ; Returns false.
*/
class RightsTree {
	/**
		@desc		Constructs a new rights tree.
	*/
	constructor() {
		/**
			@private
			@member {Map.<(String|Symbol), Map>}	module:odin/http.RightsTree[SYMBOL_MEMBER_TREE]
			@desc									Tree to store rights.
		*/
		Object.defineProperty(this, SYMBOL_MEMBER_TREE, {value:new Map()});
	}

	/**
		@desc						Tells whether the provided right is in this tree or not.
		@param {String} p_right		Right.
		@returns					The right presence.
	*/
	has(p_right) {
		lib.odin.util.validate(p_right, VALIDATOR_RIGHT.required());
		let parts = p_right.split(SEPARATOR);
		let pointer = this[SYMBOL_MEMBER_TREE];
		for(let part of parts) {
			if(pointer.has(SYMBOL_WILDCARD)) {
				return true;
			} else if(!pointer.has(part)) {
				return false;
			}

			pointer = pointer.get(part);
		}

		return pointer.has(SYMBOL_WILDCARD);
	}

	/**
		@desc						Adds the provided right to this tree.
		@param {String} p_right		Right to add.
	*/
	add(p_right) {
		lib.odin.util.validate(p_right, VALIDATOR_RIGHT_WILDCARD.required());
		let parts = p_right.split(SEPARATOR);
		if(parts[parts.length - 1] == WILDCARD) {
			parts.pop();
		}

		let pointer = this[SYMBOL_MEMBER_TREE];
		for(let part of parts) {
			if(pointer.has(SYMBOL_WILDCARD)) {
				return;
			} else if(!pointer.has(part)) {
				pointer.set(part, new Map());
			}

			pointer = pointer.get(part);
		}

		pointer.clear();
		pointer.set(SYMBOL_WILDCARD, null);
	}

	/**
		@desc		Removes all the registered rights.
	*/
	clear() {
		lib.odin.util.validate(p_right, VALIDATOR_RIGHT_WILDCARD.required());
	}

	/**
		@desc									Iterates through the entire sub-node and yields leaves absolute paths.
		@param {Map.<(String|Symbol), Map>}		Tree node.
		@param {Array.<String>}					Full path.
		@returns {Iterator.<String>}			Leaves absolute paths.
	*/
	*[SYMBOL_METHOD_WALK](p_node, p_path) {
		if(p_node.has(SYMBOL_WILDCARD)) {
			yield [].concat(p_path, WILDCARD).join(SEPARATOR);
			return;
		}

		for(let entry of p_node) {
			yield* this[SYMBOL_METHOD_WALK](entry[1], [].concat(p_path, entry[0]));
		}
	}

	/**
		@desc							Iterates through the minimal rights tree and returns the absuolute paths for each one.
		@returns {Iterator.<String>}	Iterator for the rights list.
	*/
	*[Symbol.iterator]() {
		yield* this[SYMBOL_METHOD_WALK](this[SYMBOL_MEMBER_TREE], []);
	}
}

/**
	@member {joi.Validator}		module:odin/http.RightsTree.VALIDATOR_RIGHT_WILDCARD
	@desc						Right validator (wildcards supported).
*/
Object.defineProperty(RightsTree, 'VALIDATOR_RIGHT_WILDCARD', {enumerable:true, value:VALIDATOR_RIGHT_WILDCARD});

/**
	@member {joi.Validator}		module:odin/http.RightsTree.VALIDATOR_RIGHT
	@desc						Right validator (wildcards not supported).
*/
Object.defineProperty(RightsTree, 'VALIDATOR_RIGHT', {enumerable:true, value:VALIDATOR_RIGHT});

module.exports = RightsTree;