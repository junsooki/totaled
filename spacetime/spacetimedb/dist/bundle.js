import { env_get } from "spacetime:sys@2.2";
import * as _syscalls2_0 from "spacetime:sys@2.0";
import { moduleHooks } from "spacetime:sys@2.0";
import * as _syscalls2_1 from "spacetime:sys@2.1";

//#region node_modules/headers-polyfill/lib/index.mjs
var __create$1 = Object.create;
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames$1 = Object.getOwnPropertyNames;
var __getProtoOf$1 = Object.getPrototypeOf;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __commonJS$1 = (cb, mod) => function __require() {
	return mod || (0, cb[__getOwnPropNames$1(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps$1 = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (let key of __getOwnPropNames$1(from)) if (!__hasOwnProp$1.call(to, key) && key !== except) __defProp$1(to, key, {
			get: () => from[key],
			enumerable: !(desc = __getOwnPropDesc$1(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM$1 = (mod, isNodeMode, target) => (target = mod != null ? __create$1(__getProtoOf$1(mod)) : {}, __copyProps$1(isNodeMode || !mod || !mod.__esModule ? __defProp$1(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
var import_set_cookie_parser = __toESM$1(__commonJS$1({ "node_modules/set-cookie-parser/lib/set-cookie.js"(exports, module) {
	"use strict";
	var defaultParseOptions = {
		decodeValues: true,
		map: false,
		silent: false
	};
	function isNonEmptyString(str) {
		return typeof str === "string" && !!str.trim();
	}
	function parseString(setCookieValue, options) {
		var parts = setCookieValue.split(";").filter(isNonEmptyString);
		var parsed = parseNameValuePair(parts.shift());
		var name = parsed.name;
		var value = parsed.value;
		options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
		try {
			value = options.decodeValues ? decodeURIComponent(value) : value;
		} catch (e) {
			console.error("set-cookie-parser encountered an error while decoding a cookie with value '" + value + "'. Set options.decodeValues to false to disable this feature.", e);
		}
		var cookie = {
			name,
			value
		};
		parts.forEach(function(part) {
			var sides = part.split("=");
			var key = sides.shift().trimLeft().toLowerCase();
			var value2 = sides.join("=");
			if (key === "expires") cookie.expires = new Date(value2);
			else if (key === "max-age") cookie.maxAge = parseInt(value2, 10);
			else if (key === "secure") cookie.secure = true;
			else if (key === "httponly") cookie.httpOnly = true;
			else if (key === "samesite") cookie.sameSite = value2;
			else cookie[key] = value2;
		});
		return cookie;
	}
	function parseNameValuePair(nameValuePairStr) {
		var name = "";
		var value = "";
		var nameValueArr = nameValuePairStr.split("=");
		if (nameValueArr.length > 1) {
			name = nameValueArr.shift();
			value = nameValueArr.join("=");
		} else value = nameValuePairStr;
		return {
			name,
			value
		};
	}
	function parse(input, options) {
		options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
		if (!input) if (!options.map) return [];
		else return {};
		if (input.headers) if (typeof input.headers.getSetCookie === "function") input = input.headers.getSetCookie();
		else if (input.headers["set-cookie"]) input = input.headers["set-cookie"];
		else {
			var sch = input.headers[Object.keys(input.headers).find(function(key) {
				return key.toLowerCase() === "set-cookie";
			})];
			if (!sch && input.headers.cookie && !options.silent) console.warn("Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning.");
			input = sch;
		}
		if (!Array.isArray(input)) input = [input];
		options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
		if (!options.map) return input.filter(isNonEmptyString).map(function(str) {
			return parseString(str, options);
		});
		else return input.filter(isNonEmptyString).reduce(function(cookies2, str) {
			var cookie = parseString(str, options);
			cookies2[cookie.name] = cookie;
			return cookies2;
		}, {});
	}
	function splitCookiesString2(cookiesString) {
		if (Array.isArray(cookiesString)) return cookiesString;
		if (typeof cookiesString !== "string") return [];
		var cookiesStrings = [];
		var pos = 0;
		var start;
		var ch;
		var lastComma;
		var nextStart;
		var cookiesSeparatorFound;
		function skipWhitespace() {
			while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) pos += 1;
			return pos < cookiesString.length;
		}
		function notSpecialChar() {
			ch = cookiesString.charAt(pos);
			return ch !== "=" && ch !== ";" && ch !== ",";
		}
		while (pos < cookiesString.length) {
			start = pos;
			cookiesSeparatorFound = false;
			while (skipWhitespace()) {
				ch = cookiesString.charAt(pos);
				if (ch === ",") {
					lastComma = pos;
					pos += 1;
					skipWhitespace();
					nextStart = pos;
					while (pos < cookiesString.length && notSpecialChar()) pos += 1;
					if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
						cookiesSeparatorFound = true;
						pos = nextStart;
						cookiesStrings.push(cookiesString.substring(start, lastComma));
						start = pos;
					} else pos = lastComma + 1;
				} else pos += 1;
			}
			if (!cookiesSeparatorFound || pos >= cookiesString.length) cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
		}
		return cookiesStrings;
	}
	module.exports = parse;
	module.exports.parse = parse;
	module.exports.parseString = parseString;
	module.exports.splitCookiesString = splitCookiesString2;
} })());
var HEADERS_INVALID_CHARACTERS = /[^a-z0-9\-#$%&'*+.^_`|~]/i;
function normalizeHeaderName(name) {
	if (HEADERS_INVALID_CHARACTERS.test(name) || name.trim() === "") throw new TypeError("Invalid character in header field name");
	return name.trim().toLowerCase();
}
var charCodesToRemove = [
	String.fromCharCode(10),
	String.fromCharCode(13),
	String.fromCharCode(9),
	String.fromCharCode(32)
];
var HEADER_VALUE_REMOVE_REGEXP = new RegExp(`(^[${charCodesToRemove.join("")}]|$[${charCodesToRemove.join("")}])`, "g");
function normalizeHeaderValue(value) {
	return value.replace(HEADER_VALUE_REMOVE_REGEXP, "");
}
function isValidHeaderName(value) {
	if (typeof value !== "string") return false;
	if (value.length === 0) return false;
	for (let i = 0; i < value.length; i++) {
		const character = value.charCodeAt(i);
		if (character > 127 || !isToken(character)) return false;
	}
	return true;
}
function isToken(value) {
	return ![
		127,
		32,
		"(",
		")",
		"<",
		">",
		"@",
		",",
		";",
		":",
		"\\",
		"\"",
		"/",
		"[",
		"]",
		"?",
		"=",
		"{",
		"}"
	].includes(value);
}
function isValidHeaderValue(value) {
	if (typeof value !== "string") return false;
	if (value.trim() !== value) return false;
	for (let i = 0; i < value.length; i++) {
		const character = value.charCodeAt(i);
		if (character === 0 || character === 10 || character === 13) return false;
	}
	return true;
}
var NORMALIZED_HEADERS = Symbol("normalizedHeaders");
var RAW_HEADER_NAMES = Symbol("rawHeaderNames");
var HEADER_VALUE_DELIMITER = ", ";
var _a, _b, _c;
var Headers = class _Headers {
	constructor(init) {
		this[_a] = {};
		this[_b] = /* @__PURE__ */ new Map();
		this[_c] = "Headers";
		if (["Headers", "HeadersPolyfill"].includes(init?.constructor.name) || init instanceof _Headers || typeof globalThis.Headers !== "undefined" && init instanceof globalThis.Headers) init.forEach((value, name) => {
			this.append(name, value);
		}, this);
		else if (Array.isArray(init)) init.forEach(([name, value]) => {
			this.append(name, Array.isArray(value) ? value.join(HEADER_VALUE_DELIMITER) : value);
		});
		else if (init) Object.getOwnPropertyNames(init).forEach((name) => {
			const value = init[name];
			this.append(name, Array.isArray(value) ? value.join(HEADER_VALUE_DELIMITER) : value);
		});
	}
	[(_a = NORMALIZED_HEADERS, _b = RAW_HEADER_NAMES, _c = Symbol.toStringTag, Symbol.iterator)]() {
		return this.entries();
	}
	*keys() {
		for (const [name] of this.entries()) yield name;
	}
	*values() {
		for (const [, value] of this.entries()) yield value;
	}
	*entries() {
		let sortedKeys = Object.keys(this[NORMALIZED_HEADERS]).sort((a, b) => a.localeCompare(b));
		for (const name of sortedKeys) if (name === "set-cookie") for (const value of this.getSetCookie()) yield [name, value];
		else yield [name, this.get(name)];
	}
	/**
	* Returns a boolean stating whether a `Headers` object contains a certain header.
	*/
	has(name) {
		if (!isValidHeaderName(name)) throw new TypeError(`Invalid header name "${name}"`);
		return this[NORMALIZED_HEADERS].hasOwnProperty(normalizeHeaderName(name));
	}
	/**
	* Returns a `ByteString` sequence of all the values of a header with a given name.
	*/
	get(name) {
		if (!isValidHeaderName(name)) throw TypeError(`Invalid header name "${name}"`);
		return this[NORMALIZED_HEADERS][normalizeHeaderName(name)] ?? null;
	}
	/**
	* Sets a new value for an existing header inside a `Headers` object, or adds the header if it does not already exist.
	*/
	set(name, value) {
		if (!isValidHeaderName(name) || !isValidHeaderValue(value)) return;
		const normalizedName = normalizeHeaderName(name);
		const normalizedValue = normalizeHeaderValue(value);
		this[NORMALIZED_HEADERS][normalizedName] = normalizeHeaderValue(normalizedValue);
		this[RAW_HEADER_NAMES].set(normalizedName, name);
	}
	/**
	* Appends a new value onto an existing header inside a `Headers` object, or adds the header if it does not already exist.
	*/
	append(name, value) {
		if (!isValidHeaderName(name) || !isValidHeaderValue(value)) return;
		const normalizedName = normalizeHeaderName(name);
		const normalizedValue = normalizeHeaderValue(value);
		let resolvedValue = this.has(normalizedName) ? `${this.get(normalizedName)}, ${normalizedValue}` : normalizedValue;
		this.set(name, resolvedValue);
	}
	/**
	* Deletes a header from the `Headers` object.
	*/
	delete(name) {
		if (!isValidHeaderName(name)) return;
		if (!this.has(name)) return;
		const normalizedName = normalizeHeaderName(name);
		delete this[NORMALIZED_HEADERS][normalizedName];
		this[RAW_HEADER_NAMES].delete(normalizedName);
	}
	/**
	* Traverses the `Headers` object,
	* calling the given callback for each header.
	*/
	forEach(callback, thisArg) {
		for (const [name, value] of this.entries()) callback.call(thisArg, value, name, this);
	}
	/**
	* Returns an array containing the values
	* of all Set-Cookie headers associated
	* with a response
	*/
	getSetCookie() {
		const setCookieHeader = this.get("set-cookie");
		if (setCookieHeader === null) return [];
		if (setCookieHeader === "") return [""];
		return (0, import_set_cookie_parser.splitCookiesString)(setCookieHeader);
	}
};

//#endregion
//#region node_modules/spacetimedb/dist/server/index.mjs
typeof globalThis !== "undefined" && (globalThis.global = globalThis.global || globalThis, globalThis.window = globalThis.window || globalThis);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
	return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: () => from[key],
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(__defProp(target, "default", {
	value: mod,
	enumerable: true
}), mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var require_base64_js = __commonJS({ "../../node_modules/.pnpm/base64-js@1.5.1/node_modules/base64-js/index.js"(exports) {
	exports.byteLength = byteLength;
	exports.toByteArray = toByteArray;
	exports.fromByteArray = fromByteArray2;
	var lookup = [];
	var revLookup = [];
	var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
	var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	for (i = 0, len = code.length; i < len; ++i) {
		lookup[i] = code[i];
		revLookup[code.charCodeAt(i)] = i;
	}
	var i;
	var len;
	revLookup["-".charCodeAt(0)] = 62;
	revLookup["_".charCodeAt(0)] = 63;
	function getLens(b64) {
		var len2 = b64.length;
		if (len2 % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
		var validLen = b64.indexOf("=");
		if (validLen === -1) validLen = len2;
		var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
		return [validLen, placeHoldersLen];
	}
	function byteLength(b64) {
		var lens = getLens(b64);
		var validLen = lens[0];
		var placeHoldersLen = lens[1];
		return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
	}
	function _byteLength(b64, validLen, placeHoldersLen) {
		return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
	}
	function toByteArray(b64) {
		var tmp;
		var lens = getLens(b64);
		var validLen = lens[0];
		var placeHoldersLen = lens[1];
		var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
		var curByte = 0;
		var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
		var i2;
		for (i2 = 0; i2 < len2; i2 += 4) {
			tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
			arr[curByte++] = tmp >> 16 & 255;
			arr[curByte++] = tmp >> 8 & 255;
			arr[curByte++] = tmp & 255;
		}
		if (placeHoldersLen === 2) {
			tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
			arr[curByte++] = tmp & 255;
		}
		if (placeHoldersLen === 1) {
			tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
			arr[curByte++] = tmp >> 8 & 255;
			arr[curByte++] = tmp & 255;
		}
		return arr;
	}
	function tripletToBase64(num) {
		return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
	}
	function encodeChunk(uint8, start, end) {
		var tmp;
		var output = [];
		for (var i2 = start; i2 < end; i2 += 3) {
			tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
			output.push(tripletToBase64(tmp));
		}
		return output.join("");
	}
	function fromByteArray2(uint8) {
		var tmp;
		var len2 = uint8.length;
		var extraBytes = len2 % 3;
		var parts = [];
		var maxChunkLength = 16383;
		for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
		if (extraBytes === 1) {
			tmp = uint8[len2 - 1];
			parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
		} else if (extraBytes === 2) {
			tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
			parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
		}
		return parts.join("");
	}
} });
var require_codes = __commonJS({ "../../node_modules/.pnpm/statuses@2.0.2/node_modules/statuses/codes.json"(exports, module) {
	module.exports = {
		"100": "Continue",
		"101": "Switching Protocols",
		"102": "Processing",
		"103": "Early Hints",
		"200": "OK",
		"201": "Created",
		"202": "Accepted",
		"203": "Non-Authoritative Information",
		"204": "No Content",
		"205": "Reset Content",
		"206": "Partial Content",
		"207": "Multi-Status",
		"208": "Already Reported",
		"226": "IM Used",
		"300": "Multiple Choices",
		"301": "Moved Permanently",
		"302": "Found",
		"303": "See Other",
		"304": "Not Modified",
		"305": "Use Proxy",
		"307": "Temporary Redirect",
		"308": "Permanent Redirect",
		"400": "Bad Request",
		"401": "Unauthorized",
		"402": "Payment Required",
		"403": "Forbidden",
		"404": "Not Found",
		"405": "Method Not Allowed",
		"406": "Not Acceptable",
		"407": "Proxy Authentication Required",
		"408": "Request Timeout",
		"409": "Conflict",
		"410": "Gone",
		"411": "Length Required",
		"412": "Precondition Failed",
		"413": "Payload Too Large",
		"414": "URI Too Long",
		"415": "Unsupported Media Type",
		"416": "Range Not Satisfiable",
		"417": "Expectation Failed",
		"418": "I'm a Teapot",
		"421": "Misdirected Request",
		"422": "Unprocessable Entity",
		"423": "Locked",
		"424": "Failed Dependency",
		"425": "Too Early",
		"426": "Upgrade Required",
		"428": "Precondition Required",
		"429": "Too Many Requests",
		"431": "Request Header Fields Too Large",
		"451": "Unavailable For Legal Reasons",
		"500": "Internal Server Error",
		"501": "Not Implemented",
		"502": "Bad Gateway",
		"503": "Service Unavailable",
		"504": "Gateway Timeout",
		"505": "HTTP Version Not Supported",
		"506": "Variant Also Negotiates",
		"507": "Insufficient Storage",
		"508": "Loop Detected",
		"509": "Bandwidth Limit Exceeded",
		"510": "Not Extended",
		"511": "Network Authentication Required"
	};
} });
var require_statuses = __commonJS({ "../../node_modules/.pnpm/statuses@2.0.2/node_modules/statuses/index.js"(exports, module) {
	var codes = require_codes();
	module.exports = status2;
	status2.message = codes;
	status2.code = createMessageToStatusCodeMap(codes);
	status2.codes = createStatusCodeList(codes);
	status2.redirect = {
		300: true,
		301: true,
		302: true,
		303: true,
		305: true,
		307: true,
		308: true
	};
	status2.empty = {
		204: true,
		205: true,
		304: true
	};
	status2.retry = {
		502: true,
		503: true,
		504: true
	};
	function createMessageToStatusCodeMap(codes2) {
		var map = {};
		Object.keys(codes2).forEach(function forEachCode(code) {
			var message = codes2[code];
			var status3 = Number(code);
			map[message.toLowerCase()] = status3;
		});
		return map;
	}
	function createStatusCodeList(codes2) {
		return Object.keys(codes2).map(function mapCode(code) {
			return Number(code);
		});
	}
	function getStatusCode(message) {
		var msg = message.toLowerCase();
		if (!Object.prototype.hasOwnProperty.call(status2.code, msg)) throw new Error("invalid status message: \"" + message + "\"");
		return status2.code[msg];
	}
	function getStatusMessage(code) {
		if (!Object.prototype.hasOwnProperty.call(status2.message, code)) throw new Error("invalid status code: " + code);
		return status2.message[code];
	}
	function status2(code) {
		if (typeof code === "number") return getStatusMessage(code);
		if (typeof code !== "string") throw new TypeError("code must be a number or string");
		var n = parseInt(code, 10);
		if (!isNaN(n)) return getStatusMessage(n);
		return getStatusCode(code);
	}
} });
var util_stub_exports = {};
__export(util_stub_exports, { inspect: () => inspect });
var inspect;
var init_util_stub = __esm({ "src/util-stub.ts"() {
	inspect = {};
} });
var require_util_inspect = __commonJS({ "../../node_modules/.pnpm/object-inspect@1.13.4/node_modules/object-inspect/util.inspect.js"(exports, module) {
	module.exports = (init_util_stub(), __toCommonJS(util_stub_exports)).inspect;
} });
var require_object_inspect = __commonJS({ "../../node_modules/.pnpm/object-inspect@1.13.4/node_modules/object-inspect/index.js"(exports, module) {
	var hasMap = typeof Map === "function" && Map.prototype;
	var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null;
	var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === "function" ? mapSizeDescriptor.get : null;
	var mapForEach = hasMap && Map.prototype.forEach;
	var hasSet = typeof Set === "function" && Set.prototype;
	var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null;
	var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === "function" ? setSizeDescriptor.get : null;
	var setForEach = hasSet && Set.prototype.forEach;
	var weakMapHas = typeof WeakMap === "function" && WeakMap.prototype ? WeakMap.prototype.has : null;
	var weakSetHas = typeof WeakSet === "function" && WeakSet.prototype ? WeakSet.prototype.has : null;
	var weakRefDeref = typeof WeakRef === "function" && WeakRef.prototype ? WeakRef.prototype.deref : null;
	var booleanValueOf = Boolean.prototype.valueOf;
	var objectToString = Object.prototype.toString;
	var functionToString = Function.prototype.toString;
	var $match = String.prototype.match;
	var $slice = String.prototype.slice;
	var $replace = String.prototype.replace;
	var $toUpperCase = String.prototype.toUpperCase;
	var $toLowerCase = String.prototype.toLowerCase;
	var $test = RegExp.prototype.test;
	var $concat = Array.prototype.concat;
	var $join = Array.prototype.join;
	var $arrSlice = Array.prototype.slice;
	var $floor = Math.floor;
	var bigIntValueOf = typeof BigInt === "function" ? BigInt.prototype.valueOf : null;
	var gOPS = Object.getOwnPropertySymbols;
	var symToString = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol.prototype.toString : null;
	var hasShammedSymbols = typeof Symbol === "function" && typeof Symbol.iterator === "object";
	var toStringTag = typeof Symbol === "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? "object" : "symbol") ? Symbol.toStringTag : null;
	var isEnumerable = Object.prototype.propertyIsEnumerable;
	var gPO = (typeof Reflect === "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(O) {
		return O.__proto__;
	} : null);
	function addNumericSeparator(num, str) {
		if (num === Infinity || num === -Infinity || num !== num || num && num > -1e3 && num < 1e3 || $test.call(/e/, str)) return str;
		var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
		if (typeof num === "number") {
			var int = num < 0 ? -$floor(-num) : $floor(num);
			if (int !== num) {
				var intStr = String(int);
				var dec = $slice.call(str, intStr.length + 1);
				return $replace.call(intStr, sepRegex, "$&_") + "." + $replace.call($replace.call(dec, /([0-9]{3})/g, "$&_"), /_$/, "");
			}
		}
		return $replace.call(str, sepRegex, "$&_");
	}
	var utilInspect = require_util_inspect();
	var inspectCustom = utilInspect.custom;
	var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;
	var quotes = {
		__proto__: null,
		"double": "\"",
		single: "'"
	};
	var quoteREs = {
		__proto__: null,
		"double": /(["\\])/g,
		single: /(['\\])/g
	};
	module.exports = function inspect_(obj, options, depth, seen) {
		var opts = options || {};
		if (has(opts, "quoteStyle") && !has(quotes, opts.quoteStyle)) throw new TypeError("option \"quoteStyle\" must be \"single\" or \"double\"");
		if (has(opts, "maxStringLength") && (typeof opts.maxStringLength === "number" ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) throw new TypeError("option \"maxStringLength\", if provided, must be a positive integer, Infinity, or `null`");
		var customInspect = has(opts, "customInspect") ? opts.customInspect : true;
		if (typeof customInspect !== "boolean" && customInspect !== "symbol") throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
		if (has(opts, "indent") && opts.indent !== null && opts.indent !== "	" && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) throw new TypeError("option \"indent\" must be \"\\t\", an integer > 0, or `null`");
		if (has(opts, "numericSeparator") && typeof opts.numericSeparator !== "boolean") throw new TypeError("option \"numericSeparator\", if provided, must be `true` or `false`");
		var numericSeparator = opts.numericSeparator;
		if (typeof obj === "undefined") return "undefined";
		if (obj === null) return "null";
		if (typeof obj === "boolean") return obj ? "true" : "false";
		if (typeof obj === "string") return inspectString(obj, opts);
		if (typeof obj === "number") {
			if (obj === 0) return Infinity / obj > 0 ? "0" : "-0";
			var str = String(obj);
			return numericSeparator ? addNumericSeparator(obj, str) : str;
		}
		if (typeof obj === "bigint") {
			var bigIntStr = String(obj) + "n";
			return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
		}
		var maxDepth = typeof opts.depth === "undefined" ? 5 : opts.depth;
		if (typeof depth === "undefined") depth = 0;
		if (depth >= maxDepth && maxDepth > 0 && typeof obj === "object") return isArray(obj) ? "[Array]" : "[Object]";
		var indent = getIndent(opts, depth);
		if (typeof seen === "undefined") seen = [];
		else if (indexOf(seen, obj) >= 0) return "[Circular]";
		function inspect3(value, from, noIndent) {
			if (from) {
				seen = $arrSlice.call(seen);
				seen.push(from);
			}
			if (noIndent) {
				var newOpts = { depth: opts.depth };
				if (has(opts, "quoteStyle")) newOpts.quoteStyle = opts.quoteStyle;
				return inspect_(value, newOpts, depth + 1, seen);
			}
			return inspect_(value, opts, depth + 1, seen);
		}
		if (typeof obj === "function" && !isRegExp(obj)) {
			var name = nameOf(obj);
			var keys = arrObjKeys(obj, inspect3);
			return "[Function" + (name ? ": " + name : " (anonymous)") + "]" + (keys.length > 0 ? " { " + $join.call(keys, ", ") + " }" : "");
		}
		if (isSymbol(obj)) {
			var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, "$1") : symToString.call(obj);
			return typeof obj === "object" && !hasShammedSymbols ? markBoxed(symString) : symString;
		}
		if (isElement(obj)) {
			var s = "<" + $toLowerCase.call(String(obj.nodeName));
			var attrs = obj.attributes || [];
			for (var i = 0; i < attrs.length; i++) s += " " + attrs[i].name + "=" + wrapQuotes(quote(attrs[i].value), "double", opts);
			s += ">";
			if (obj.childNodes && obj.childNodes.length) s += "...";
			s += "</" + $toLowerCase.call(String(obj.nodeName)) + ">";
			return s;
		}
		if (isArray(obj)) {
			if (obj.length === 0) return "[]";
			var xs = arrObjKeys(obj, inspect3);
			if (indent && !singleLineValues(xs)) return "[" + indentedJoin(xs, indent) + "]";
			return "[ " + $join.call(xs, ", ") + " ]";
		}
		if (isError(obj)) {
			var parts = arrObjKeys(obj, inspect3);
			if (!("cause" in Error.prototype) && "cause" in obj && !isEnumerable.call(obj, "cause")) return "{ [" + String(obj) + "] " + $join.call($concat.call("[cause]: " + inspect3(obj.cause), parts), ", ") + " }";
			if (parts.length === 0) return "[" + String(obj) + "]";
			return "{ [" + String(obj) + "] " + $join.call(parts, ", ") + " }";
		}
		if (typeof obj === "object" && customInspect) {
			if (inspectSymbol && typeof obj[inspectSymbol] === "function" && utilInspect) return utilInspect(obj, { depth: maxDepth - depth });
			else if (customInspect !== "symbol" && typeof obj.inspect === "function") return obj.inspect();
		}
		if (isMap(obj)) {
			var mapParts = [];
			if (mapForEach) mapForEach.call(obj, function(value, key) {
				mapParts.push(inspect3(key, obj, true) + " => " + inspect3(value, obj));
			});
			return collectionOf("Map", mapSize.call(obj), mapParts, indent);
		}
		if (isSet(obj)) {
			var setParts = [];
			if (setForEach) setForEach.call(obj, function(value) {
				setParts.push(inspect3(value, obj));
			});
			return collectionOf("Set", setSize.call(obj), setParts, indent);
		}
		if (isWeakMap(obj)) return weakCollectionOf("WeakMap");
		if (isWeakSet(obj)) return weakCollectionOf("WeakSet");
		if (isWeakRef(obj)) return weakCollectionOf("WeakRef");
		if (isNumber(obj)) return markBoxed(inspect3(Number(obj)));
		if (isBigInt(obj)) return markBoxed(inspect3(bigIntValueOf.call(obj)));
		if (isBoolean(obj)) return markBoxed(booleanValueOf.call(obj));
		if (isString(obj)) return markBoxed(inspect3(String(obj)));
		if (typeof window !== "undefined" && obj === window) return "{ [object Window] }";
		if (typeof globalThis !== "undefined" && obj === globalThis || typeof global !== "undefined" && obj === global) return "{ [object globalThis] }";
		if (!isDate(obj) && !isRegExp(obj)) {
			var ys = arrObjKeys(obj, inspect3);
			var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
			var protoTag = obj instanceof Object ? "" : "null prototype";
			var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? "Object" : "";
			var tag = (isPlainObject || typeof obj.constructor !== "function" ? "" : obj.constructor.name ? obj.constructor.name + " " : "") + (stringTag || protoTag ? "[" + $join.call($concat.call([], stringTag || [], protoTag || []), ": ") + "] " : "");
			if (ys.length === 0) return tag + "{}";
			if (indent) return tag + "{" + indentedJoin(ys, indent) + "}";
			return tag + "{ " + $join.call(ys, ", ") + " }";
		}
		return String(obj);
	};
	function wrapQuotes(s, defaultStyle, opts) {
		var quoteChar = quotes[opts.quoteStyle || defaultStyle];
		return quoteChar + s + quoteChar;
	}
	function quote(s) {
		return $replace.call(String(s), /"/g, "&quot;");
	}
	function canTrustToString(obj) {
		return !toStringTag || !(typeof obj === "object" && (toStringTag in obj || typeof obj[toStringTag] !== "undefined"));
	}
	function isArray(obj) {
		return toStr(obj) === "[object Array]" && canTrustToString(obj);
	}
	function isDate(obj) {
		return toStr(obj) === "[object Date]" && canTrustToString(obj);
	}
	function isRegExp(obj) {
		return toStr(obj) === "[object RegExp]" && canTrustToString(obj);
	}
	function isError(obj) {
		return toStr(obj) === "[object Error]" && canTrustToString(obj);
	}
	function isString(obj) {
		return toStr(obj) === "[object String]" && canTrustToString(obj);
	}
	function isNumber(obj) {
		return toStr(obj) === "[object Number]" && canTrustToString(obj);
	}
	function isBoolean(obj) {
		return toStr(obj) === "[object Boolean]" && canTrustToString(obj);
	}
	function isSymbol(obj) {
		if (hasShammedSymbols) return obj && typeof obj === "object" && obj instanceof Symbol;
		if (typeof obj === "symbol") return true;
		if (!obj || typeof obj !== "object" || !symToString) return false;
		try {
			symToString.call(obj);
			return true;
		} catch (e) {}
		return false;
	}
	function isBigInt(obj) {
		if (!obj || typeof obj !== "object" || !bigIntValueOf) return false;
		try {
			bigIntValueOf.call(obj);
			return true;
		} catch (e) {}
		return false;
	}
	var hasOwn2 = Object.prototype.hasOwnProperty || function(key) {
		return key in this;
	};
	function has(obj, key) {
		return hasOwn2.call(obj, key);
	}
	function toStr(obj) {
		return objectToString.call(obj);
	}
	function nameOf(f) {
		if (f.name) return f.name;
		var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
		if (m) return m[1];
		return null;
	}
	function indexOf(xs, x) {
		if (xs.indexOf) return xs.indexOf(x);
		for (var i = 0, l = xs.length; i < l; i++) if (xs[i] === x) return i;
		return -1;
	}
	function isMap(x) {
		if (!mapSize || !x || typeof x !== "object") return false;
		try {
			mapSize.call(x);
			try {
				setSize.call(x);
			} catch (s) {
				return true;
			}
			return x instanceof Map;
		} catch (e) {}
		return false;
	}
	function isWeakMap(x) {
		if (!weakMapHas || !x || typeof x !== "object") return false;
		try {
			weakMapHas.call(x, weakMapHas);
			try {
				weakSetHas.call(x, weakSetHas);
			} catch (s) {
				return true;
			}
			return x instanceof WeakMap;
		} catch (e) {}
		return false;
	}
	function isWeakRef(x) {
		if (!weakRefDeref || !x || typeof x !== "object") return false;
		try {
			weakRefDeref.call(x);
			return true;
		} catch (e) {}
		return false;
	}
	function isSet(x) {
		if (!setSize || !x || typeof x !== "object") return false;
		try {
			setSize.call(x);
			try {
				mapSize.call(x);
			} catch (m) {
				return true;
			}
			return x instanceof Set;
		} catch (e) {}
		return false;
	}
	function isWeakSet(x) {
		if (!weakSetHas || !x || typeof x !== "object") return false;
		try {
			weakSetHas.call(x, weakSetHas);
			try {
				weakMapHas.call(x, weakMapHas);
			} catch (s) {
				return true;
			}
			return x instanceof WeakSet;
		} catch (e) {}
		return false;
	}
	function isElement(x) {
		if (!x || typeof x !== "object") return false;
		if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) return true;
		return typeof x.nodeName === "string" && typeof x.getAttribute === "function";
	}
	function inspectString(str, opts) {
		if (str.length > opts.maxStringLength) {
			var remaining = str.length - opts.maxStringLength;
			var trailer = "... " + remaining + " more character" + (remaining > 1 ? "s" : "");
			return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
		}
		var quoteRE = quoteREs[opts.quoteStyle || "single"];
		quoteRE.lastIndex = 0;
		return wrapQuotes($replace.call($replace.call(str, quoteRE, "\\$1"), /[\x00-\x1f]/g, lowbyte), "single", opts);
	}
	function lowbyte(c) {
		var n = c.charCodeAt(0);
		var x = {
			8: "b",
			9: "t",
			10: "n",
			12: "f",
			13: "r"
		}[n];
		if (x) return "\\" + x;
		return "\\x" + (n < 16 ? "0" : "") + $toUpperCase.call(n.toString(16));
	}
	function markBoxed(str) {
		return "Object(" + str + ")";
	}
	function weakCollectionOf(type) {
		return type + " { ? }";
	}
	function collectionOf(type, size, entries, indent) {
		var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ", ");
		return type + " (" + size + ") {" + joinedEntries + "}";
	}
	function singleLineValues(xs) {
		for (var i = 0; i < xs.length; i++) if (indexOf(xs[i], "\n") >= 0) return false;
		return true;
	}
	function getIndent(opts, depth) {
		var baseIndent;
		if (opts.indent === "	") baseIndent = "	";
		else if (typeof opts.indent === "number" && opts.indent > 0) baseIndent = $join.call(Array(opts.indent + 1), " ");
		else return null;
		return {
			base: baseIndent,
			prev: $join.call(Array(depth + 1), baseIndent)
		};
	}
	function indentedJoin(xs, indent) {
		if (xs.length === 0) return "";
		var lineJoiner = "\n" + indent.prev + indent.base;
		return lineJoiner + $join.call(xs, "," + lineJoiner) + "\n" + indent.prev;
	}
	function arrObjKeys(obj, inspect3) {
		var isArr = isArray(obj);
		var xs = [];
		if (isArr) {
			xs.length = obj.length;
			for (var i = 0; i < obj.length; i++) xs[i] = has(obj, i) ? inspect3(obj[i], obj) : "";
		}
		var syms = typeof gOPS === "function" ? gOPS(obj) : [];
		var symMap;
		if (hasShammedSymbols) {
			symMap = {};
			for (var k = 0; k < syms.length; k++) symMap["$" + syms[k]] = syms[k];
		}
		for (var key in obj) {
			if (!has(obj, key)) continue;
			if (isArr && String(Number(key)) === key && key < obj.length) continue;
			if (hasShammedSymbols && symMap["$" + key] instanceof Symbol) continue;
			else if ($test.call(/[^\w$]/, key)) xs.push(inspect3(key, obj) + ": " + inspect3(obj[key], obj));
			else xs.push(key + ": " + inspect3(obj[key], obj));
		}
		if (typeof gOPS === "function") {
			for (var j = 0; j < syms.length; j++) if (isEnumerable.call(obj, syms[j])) xs.push("[" + inspect3(syms[j]) + "]: " + inspect3(obj[syms[j]], obj));
		}
		return xs;
	}
} });
var textDecoder = new TextDecoder("utf-8");
var BinaryReader = class {
	/**
	* The DataView used to read values from the binary data.
	*
	* Note: The DataView's `byteOffset` is relative to the beginning of the
	* underlying ArrayBuffer, not the start of the provided Uint8Array input.
	* This `BinaryReader`'s `#offset` field is used to track the current read position
	* relative to the start of the provided Uint8Array input.
	*/
	view;
	/**
	* Represents the offset (in bytes) relative to the start of the DataView
	* and provided Uint8Array input.
	*
	* Note: This is *not* the absolute byte offset within the underlying ArrayBuffer.
	*/
	offset = 0;
	constructor(input) {
		this.view = input instanceof DataView ? input : new DataView(input.buffer, input.byteOffset, input.byteLength);
		this.offset = 0;
	}
	reset(input) {
		this.view = input instanceof DataView ? input : new DataView(input.buffer, input.byteOffset, input.byteLength);
		this.offset = 0;
	}
	get remaining() {
		return this.view.byteLength - this.offset;
	}
	/** Ensure we have at least `n` bytes left to read */
	#ensure(n) {
		if (this.offset + n > this.view.byteLength) throw new RangeError(`Tried to read ${n} byte(s) at relative offset ${this.offset}, but only ${this.remaining} byte(s) remain`);
	}
	readUInt8Array() {
		const length = this.readU32();
		this.#ensure(length);
		return this.readBytes(length).slice();
	}
	readBool() {
		const value = this.view.getUint8(this.offset);
		this.offset += 1;
		return value !== 0;
	}
	readByte() {
		const value = this.view.getUint8(this.offset);
		this.offset += 1;
		return value;
	}
	readBytes(length) {
		const array = new Uint8Array(this.view.buffer, this.view.byteOffset + this.offset, length);
		this.offset += length;
		return array;
	}
	readI8() {
		const value = this.view.getInt8(this.offset);
		this.offset += 1;
		return value;
	}
	readU8() {
		return this.readByte();
	}
	readI16() {
		const value = this.view.getInt16(this.offset, true);
		this.offset += 2;
		return value;
	}
	readU16() {
		const value = this.view.getUint16(this.offset, true);
		this.offset += 2;
		return value;
	}
	readI32() {
		const value = this.view.getInt32(this.offset, true);
		this.offset += 4;
		return value;
	}
	readU32() {
		const value = this.view.getUint32(this.offset, true);
		this.offset += 4;
		return value;
	}
	readI64() {
		const value = this.view.getBigInt64(this.offset, true);
		this.offset += 8;
		return value;
	}
	readU64() {
		const value = this.view.getBigUint64(this.offset, true);
		this.offset += 8;
		return value;
	}
	readU128() {
		const lowerPart = this.view.getBigUint64(this.offset, true);
		const upperPart = this.view.getBigUint64(this.offset + 8, true);
		this.offset += 16;
		return (upperPart << BigInt(64)) + lowerPart;
	}
	readI128() {
		const lowerPart = this.view.getBigUint64(this.offset, true);
		const upperPart = this.view.getBigInt64(this.offset + 8, true);
		this.offset += 16;
		return (upperPart << BigInt(64)) + lowerPart;
	}
	readU256() {
		const p0 = this.view.getBigUint64(this.offset, true);
		const p1 = this.view.getBigUint64(this.offset + 8, true);
		const p2 = this.view.getBigUint64(this.offset + 16, true);
		const p3 = this.view.getBigUint64(this.offset + 24, true);
		this.offset += 32;
		return (p3 << BigInt(192)) + (p2 << BigInt(128)) + (p1 << BigInt(64)) + p0;
	}
	readI256() {
		const p0 = this.view.getBigUint64(this.offset, true);
		const p1 = this.view.getBigUint64(this.offset + 8, true);
		const p2 = this.view.getBigUint64(this.offset + 16, true);
		const p3 = this.view.getBigInt64(this.offset + 24, true);
		this.offset += 32;
		return (p3 << BigInt(192)) + (p2 << BigInt(128)) + (p1 << BigInt(64)) + p0;
	}
	readF32() {
		const value = this.view.getFloat32(this.offset, true);
		this.offset += 4;
		return value;
	}
	readF64() {
		const value = this.view.getFloat64(this.offset, true);
		this.offset += 8;
		return value;
	}
	readString() {
		const length = this.readU32();
		this.#ensure(length);
		const bytes = this.readBytes(length);
		return textDecoder.decode(bytes);
	}
};
var import_base64_js = __toESM(require_base64_js());
var textEncoder = new TextEncoder();
var ArrayBufferPrototypeTransfer = ArrayBuffer.prototype.transfer ?? function(newByteLength) {
	if (newByteLength === void 0) return this.slice();
	else if (newByteLength <= this.byteLength) return this.slice(0, newByteLength);
	else {
		const copy = new Uint8Array(newByteLength);
		copy.set(new Uint8Array(this));
		return copy.buffer;
	}
};
var ResizableBuffer = class {
	buffer;
	view;
	constructor(init) {
		this.buffer = typeof init === "number" ? new ArrayBuffer(init) : init;
		this.view = new DataView(this.buffer);
	}
	get capacity() {
		return this.buffer.byteLength;
	}
	grow(newSize) {
		if (newSize <= this.buffer.byteLength) return;
		this.buffer = ArrayBufferPrototypeTransfer.call(this.buffer, newSize);
		this.view = new DataView(this.buffer);
	}
};
var BinaryWriter = class {
	buffer;
	offset = 0;
	constructor(init) {
		this.buffer = typeof init === "number" ? new ResizableBuffer(init) : init;
	}
	clear() {
		this.offset = 0;
	}
	reset(buffer) {
		this.buffer = buffer;
		this.offset = 0;
	}
	expandBuffer(additionalCapacity) {
		const minCapacity = this.offset + additionalCapacity + 1;
		if (minCapacity <= this.buffer.capacity) return;
		let newCapacity = this.buffer.capacity * 2;
		if (newCapacity < minCapacity) newCapacity = minCapacity;
		this.buffer.grow(newCapacity);
	}
	toBase64() {
		return (0, import_base64_js.fromByteArray)(this.getBuffer());
	}
	getBuffer() {
		return new Uint8Array(this.buffer.buffer, 0, this.offset);
	}
	get view() {
		return this.buffer.view;
	}
	writeUInt8Array(value) {
		const length = value.length;
		this.expandBuffer(4 + length);
		this.writeU32(length);
		new Uint8Array(this.buffer.buffer, this.offset).set(value);
		this.offset += length;
	}
	writeBool(value) {
		this.expandBuffer(1);
		this.view.setUint8(this.offset, value ? 1 : 0);
		this.offset += 1;
	}
	writeByte(value) {
		this.expandBuffer(1);
		this.view.setUint8(this.offset, value);
		this.offset += 1;
	}
	writeBytes(value) {
		this.expandBuffer(value.length);
		new Uint8Array(this.buffer.buffer, this.offset, value.length).set(value);
		this.offset += value.length;
	}
	writeI8(value) {
		this.expandBuffer(1);
		this.view.setInt8(this.offset, value);
		this.offset += 1;
	}
	writeU8(value) {
		this.expandBuffer(1);
		this.view.setUint8(this.offset, value);
		this.offset += 1;
	}
	writeI16(value) {
		this.expandBuffer(2);
		this.view.setInt16(this.offset, value, true);
		this.offset += 2;
	}
	writeU16(value) {
		this.expandBuffer(2);
		this.view.setUint16(this.offset, value, true);
		this.offset += 2;
	}
	writeI32(value) {
		this.expandBuffer(4);
		this.view.setInt32(this.offset, value, true);
		this.offset += 4;
	}
	writeU32(value) {
		this.expandBuffer(4);
		this.view.setUint32(this.offset, value, true);
		this.offset += 4;
	}
	writeI64(value) {
		this.expandBuffer(8);
		this.view.setBigInt64(this.offset, value, true);
		this.offset += 8;
	}
	writeU64(value) {
		this.expandBuffer(8);
		this.view.setBigUint64(this.offset, value, true);
		this.offset += 8;
	}
	writeU128(value) {
		this.expandBuffer(16);
		const lowerPart = value & BigInt("0xFFFFFFFFFFFFFFFF");
		const upperPart = value >> BigInt(64);
		this.view.setBigUint64(this.offset, lowerPart, true);
		this.view.setBigUint64(this.offset + 8, upperPart, true);
		this.offset += 16;
	}
	writeI128(value) {
		this.expandBuffer(16);
		const lowerPart = value & BigInt("0xFFFFFFFFFFFFFFFF");
		const upperPart = value >> BigInt(64);
		this.view.setBigInt64(this.offset, lowerPart, true);
		this.view.setBigInt64(this.offset + 8, upperPart, true);
		this.offset += 16;
	}
	writeU256(value) {
		this.expandBuffer(32);
		const low_64_mask = BigInt("0xFFFFFFFFFFFFFFFF");
		const p0 = value & low_64_mask;
		const p1 = value >> BigInt(64) & low_64_mask;
		const p2 = value >> BigInt(128) & low_64_mask;
		const p3 = value >> BigInt(192);
		this.view.setBigUint64(this.offset + 0, p0, true);
		this.view.setBigUint64(this.offset + 8, p1, true);
		this.view.setBigUint64(this.offset + 16, p2, true);
		this.view.setBigUint64(this.offset + 24, p3, true);
		this.offset += 32;
	}
	writeI256(value) {
		this.expandBuffer(32);
		const low_64_mask = BigInt("0xFFFFFFFFFFFFFFFF");
		const p0 = value & low_64_mask;
		const p1 = value >> BigInt(64) & low_64_mask;
		const p2 = value >> BigInt(128) & low_64_mask;
		const p3 = value >> BigInt(192);
		this.view.setBigUint64(this.offset + 0, p0, true);
		this.view.setBigUint64(this.offset + 8, p1, true);
		this.view.setBigUint64(this.offset + 16, p2, true);
		this.view.setBigInt64(this.offset + 24, p3, true);
		this.offset += 32;
	}
	writeF32(value) {
		this.expandBuffer(4);
		this.view.setFloat32(this.offset, value, true);
		this.offset += 4;
	}
	writeF64(value) {
		this.expandBuffer(8);
		this.view.setFloat64(this.offset, value, true);
		this.offset += 8;
	}
	writeString(value) {
		const len = value.length;
		this.expandBuffer(4 + len);
		const bytes = new Uint8Array(this.buffer.buffer);
		let offset = this.offset + 4;
		let i = 0;
		for (; i < len; i++) {
			const c = value.charCodeAt(i);
			if (c >= 128) break;
			bytes[offset++] = c;
		}
		if (i === len) {
			this.view.setUint32(this.offset, len, true);
			this.offset = offset;
			return;
		}
		this.writeUInt8Array(textEncoder.encode(value));
	}
};
function uint8ArrayToHexString(array) {
	return Array.prototype.map.call(array.reverse(), (x) => ("00" + x.toString(16)).slice(-2)).join("");
}
function uint8ArrayToU128(array) {
	if (array.length != 16) throw new Error(`Uint8Array is not 16 bytes long: ${array}`);
	return new BinaryReader(array).readU128();
}
function uint8ArrayToU256(array) {
	if (array.length != 32) throw new Error(`Uint8Array is not 32 bytes long: [${array}]`);
	return new BinaryReader(array).readU256();
}
function hexStringToUint8Array(str) {
	if (str.startsWith("0x")) str = str.slice(2);
	const matches = str.match(/.{1,2}/g) || [];
	return Uint8Array.from(matches.map((byte) => parseInt(byte, 16))).reverse();
}
function hexStringToU128(str) {
	return uint8ArrayToU128(hexStringToUint8Array(str));
}
function hexStringToU256(str) {
	return uint8ArrayToU256(hexStringToUint8Array(str));
}
function u128ToUint8Array(data) {
	const writer = new BinaryWriter(16);
	writer.writeU128(data);
	return writer.getBuffer();
}
function u128ToHexString(data) {
	return uint8ArrayToHexString(u128ToUint8Array(data));
}
function u256ToUint8Array(data) {
	const writer = new BinaryWriter(32);
	writer.writeU256(data);
	return writer.getBuffer();
}
function u256ToHexString(data) {
	return uint8ArrayToHexString(u256ToUint8Array(data));
}
function coerceToBigInt(value, what) {
	if (typeof value === "bigint") return value;
	if (typeof value === "number") return BigInt(value);
	if (typeof value === "string" && value.trim() !== "") return BigInt(value);
	throw new TypeError(`Cannot convert ${typeof value} to ${what}: expected bigint, integer number, or decimal string`);
}
function toPascalCase(s) {
	const str = toCamelCase(s);
	return str.charAt(0).toUpperCase() + str.slice(1);
}
function toCamelCase(s) {
	const str = s.replace(/[-_]+/g, "_").replace(/_([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
	return str.charAt(0).toLowerCase() + str.slice(1);
}
function bsatnBaseSize(typespace, ty) {
	const assumedArrayLength = 4;
	while (ty.tag === "Ref") ty = typespace.types[ty.value];
	if (ty.tag === "Product") {
		let sum = 0;
		for (const { algebraicType: elem } of ty.value.elements) sum += bsatnBaseSize(typespace, elem);
		return sum;
	} else if (ty.tag === "Sum") {
		let min = Infinity;
		for (const { algebraicType: vari } of ty.value.variants) {
			const vSize = bsatnBaseSize(typespace, vari);
			if (vSize < min) min = vSize;
		}
		if (min === Infinity) min = 0;
		return 4 + min;
	} else if (ty.tag == "Array") return 4 + assumedArrayLength * bsatnBaseSize(typespace, ty.value);
	return {
		String: 4 + assumedArrayLength,
		Sum: 1,
		Bool: 1,
		I8: 1,
		U8: 1,
		I16: 2,
		U16: 2,
		I32: 4,
		U32: 4,
		F32: 4,
		I64: 8,
		U64: 8,
		F64: 8,
		I128: 16,
		U128: 16,
		I256: 32,
		U256: 32
	}[ty.tag];
}
var hasOwn = Object.hasOwn;
var TimeDuration = class _TimeDuration {
	__time_duration_micros__;
	static MICROS_PER_MILLIS = 1000n;
	/**
	* Get the algebraic type representation of the {@link TimeDuration} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__time_duration_micros__",
			algebraicType: AlgebraicType.I64
		}] });
	}
	static isTimeDuration(algebraicType) {
		if (algebraicType.tag !== "Product") return false;
		const elements = algebraicType.value.elements;
		if (elements.length !== 1) return false;
		const microsElement = elements[0];
		return microsElement.name === "__time_duration_micros__" && microsElement.algebraicType.tag === "I64";
	}
	get micros() {
		return this.__time_duration_micros__;
	}
	get millis() {
		return Number(this.micros / _TimeDuration.MICROS_PER_MILLIS);
	}
	constructor(micros) {
		this.__time_duration_micros__ = coerceToBigInt(micros, "TimeDuration");
	}
	static fromMillis(millis) {
		return new _TimeDuration(BigInt(millis) * _TimeDuration.MICROS_PER_MILLIS);
	}
	/** This outputs the same string format that we use in the host and in Rust modules */
	toString() {
		const micros = this.micros;
		const sign = micros < 0 ? "-" : "+";
		const pos = micros < 0 ? -micros : micros;
		const secs = pos / 1000000n;
		const micros_remaining = pos % 1000000n;
		return `${sign}${secs}.${String(micros_remaining).padStart(6, "0")}`;
	}
};
var Timestamp = class _Timestamp {
	__timestamp_micros_since_unix_epoch__;
	static MICROS_PER_MILLIS = 1000n;
	get microsSinceUnixEpoch() {
		return this.__timestamp_micros_since_unix_epoch__;
	}
	constructor(micros) {
		this.__timestamp_micros_since_unix_epoch__ = coerceToBigInt(micros, "Timestamp");
	}
	/**
	* Get the algebraic type representation of the {@link Timestamp} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__timestamp_micros_since_unix_epoch__",
			algebraicType: AlgebraicType.I64
		}] });
	}
	static isTimestamp(algebraicType) {
		if (algebraicType.tag !== "Product") return false;
		const elements = algebraicType.value.elements;
		if (elements.length !== 1) return false;
		const microsElement = elements[0];
		return microsElement.name === "__timestamp_micros_since_unix_epoch__" && microsElement.algebraicType.tag === "I64";
	}
	/**
	* The Unix epoch, the midnight at the beginning of January 1, 1970, UTC.
	*/
	static UNIX_EPOCH = new _Timestamp(0n);
	/**
	* Get a `Timestamp` representing the execution environment's belief of the current moment in time.
	*/
	static now() {
		return _Timestamp.fromDate(/* @__PURE__ */ new Date());
	}
	/** Convert to milliseconds since Unix epoch. */
	toMillis() {
		return this.microsSinceUnixEpoch / 1000n;
	}
	/**
	* Get a `Timestamp` representing the same point in time as `date`.
	*/
	static fromDate(date) {
		const millis = date.getTime();
		return new _Timestamp(BigInt(millis) * _Timestamp.MICROS_PER_MILLIS);
	}
	/**
	* Get a `Date` representing approximately the same point in time as `this`.
	*
	* This method truncates to millisecond precision,
	* and throws `RangeError` if the `Timestamp` is outside the range representable as a `Date`.
	*/
	toDate() {
		const millis = this.__timestamp_micros_since_unix_epoch__ / _Timestamp.MICROS_PER_MILLIS;
		if (millis > BigInt(Number.MAX_SAFE_INTEGER) || millis < BigInt(Number.MIN_SAFE_INTEGER)) throw new RangeError("Timestamp is outside of the representable range of JS's Date");
		return new Date(Number(millis));
	}
	/**
	* Get an ISO 8601 / RFC 3339 formatted string representation of this timestamp with microsecond precision.
	*
	* This method preserves the full microsecond precision of the timestamp,
	* and throws `RangeError` if the `Timestamp` is outside the range representable in ISO format.
	*
	* @returns ISO 8601 formatted string with microsecond precision (e.g., '2025-02-17T10:30:45.123456Z')
	*/
	toISOString() {
		const micros = this.__timestamp_micros_since_unix_epoch__;
		const millis = micros / _Timestamp.MICROS_PER_MILLIS;
		if (millis > BigInt(Number.MAX_SAFE_INTEGER) || millis < BigInt(Number.MIN_SAFE_INTEGER)) throw new RangeError("Timestamp is outside of the representable range for ISO string formatting");
		const isoBase = new Date(Number(millis)).toISOString();
		const microsRemainder = Math.abs(Number(micros % 1000000n));
		const fractionalPart = String(microsRemainder).padStart(6, "0");
		return isoBase.replace(/\.\d{3}Z$/, `.${fractionalPart}Z`);
	}
	since(other) {
		return new TimeDuration(this.__timestamp_micros_since_unix_epoch__ - other.__timestamp_micros_since_unix_epoch__);
	}
};
var Uuid = class _Uuid {
	__uuid__;
	/**
	* The nil UUID (all zeros).
	*
	* @example
	* ```ts
	* const uuid = Uuid.NIL;
	* console.assert(
	*   uuid.toString() === "00000000-0000-0000-0000-000000000000"
	* );
	* ```
	*/
	static NIL = new _Uuid(0n);
	static MAX_UUID_BIGINT = 340282366920938463463374607431768211455n;
	/**
	* The max UUID (all ones).
	*
	* @example
	* ```ts
	* const uuid = Uuid.MAX;
	* console.assert(
	*   uuid.toString() === "ffffffff-ffff-ffff-ffff-ffffffffffff"
	* );
	* ```
	*/
	static MAX = new _Uuid(_Uuid.MAX_UUID_BIGINT);
	/**
	* Create a UUID from a raw 128-bit value.
	*
	* @param u - Unsigned 128-bit integer
	* @throws {Error} If the value is outside the valid UUID range
	*/
	constructor(u) {
		const v = coerceToBigInt(u, "Uuid");
		if (v < 0n || v > _Uuid.MAX_UUID_BIGINT) throw new Error("Invalid UUID: must be between 0 and `MAX_UUID_BIGINT`");
		this.__uuid__ = v;
	}
	/**
	* Create a UUID `v4` from explicit random bytes.
	*
	* This method assumes the bytes are already sufficiently random.
	* It only sets the appropriate bits for the UUID version and variant.
	*
	* @param bytes - Exactly 16 random bytes
	* @returns A UUID `v4`
	* @throws {Error} If `bytes.length !== 16`
	*
	* @example
	* ```ts
	* const randomBytes = new Uint8Array(16);
	* const uuid = Uuid.fromRandomBytesV4(randomBytes);
	*
	* console.assert(
	*   uuid.toString() === "00000000-0000-4000-8000-000000000000"
	* );
	* ```
	*/
	static fromRandomBytesV4(bytes) {
		if (bytes.length !== 16) throw new Error("UUID v4 requires 16 bytes");
		const arr = new Uint8Array(bytes);
		arr[6] = arr[6] & 15 | 64;
		arr[8] = arr[8] & 63 | 128;
		return new _Uuid(_Uuid.bytesToBigInt(arr));
	}
	/**
	* Generate a UUID `v7` using a monotonic counter from `0` to `2^31 - 1`,
	* a timestamp, and 4 random bytes.
	*
	* The counter wraps around on overflow.
	*
	* The UUID `v7` is structured as follows:
	*
	* ```ascii
	* ┌───────────────────────────────────────────────┬───────────────────┐
	* | B0  | B1  | B2  | B3  | B4  | B5              |         B6        |
	* ├───────────────────────────────────────────────┼───────────────────┤
	* |                 unix_ts_ms                    |      version 7    |
	* └───────────────────────────────────────────────┴───────────────────┘
	* ┌──────────────┬─────────┬──────────────────┬───────────────────────┐
	* | B7           | B8      | B9  | B10 | B11  | B12 | B13 | B14 | B15 |
	* ├──────────────┼─────────┼──────────────────┼───────────────────────┤
	* | counter_high | variant |    counter_low   |        random         |
	* └──────────────┴─────────┴──────────────────┴───────────────────────┘
	* ```
	*
	* @param counter - Mutable monotonic counter (31-bit)
	* @param now - Timestamp since the Unix epoch
	* @param randomBytes - Exactly 4 random bytes
	* @returns A UUID `v7`
	*
	* @throws {Error} If the `counter` is negative
	* @throws {Error} If the `timestamp` is before the Unix epoch
	* @throws {Error} If `randomBytes.length !== 4`
	*
	* @example
	* ```ts
	* const now = Timestamp.fromMillis(1_686_000_000_000n);
	* const counter = { value: 1 };
	* const randomBytes = new Uint8Array(4);
	*
	* const uuid = Uuid.fromCounterV7(counter, now, randomBytes);
	*
	* console.assert(
	*   uuid.toString() === "0000647e-5180-7000-8000-000200000000"
	* );
	* ```
	*/
	static fromCounterV7(counter, now, randomBytes) {
		if (randomBytes.length !== 4) throw new Error("`fromCounterV7` requires `randomBytes.length == 4`");
		if (counter.value < 0) throw new Error("`fromCounterV7` uuid `counter` must be non-negative");
		if (now.__timestamp_micros_since_unix_epoch__ < 0) throw new Error("`fromCounterV7` `timestamp` before unix epoch");
		const counterVal = counter.value;
		counter.value = counterVal + 1 & 2147483647;
		const tsMs = now.toMillis() & 281474976710655n;
		const bytes = new Uint8Array(16);
		bytes[0] = Number(tsMs >> 40n & 255n);
		bytes[1] = Number(tsMs >> 32n & 255n);
		bytes[2] = Number(tsMs >> 24n & 255n);
		bytes[3] = Number(tsMs >> 16n & 255n);
		bytes[4] = Number(tsMs >> 8n & 255n);
		bytes[5] = Number(tsMs & 255n);
		bytes[7] = counterVal >>> 23 & 255;
		bytes[9] = counterVal >>> 15 & 255;
		bytes[10] = counterVal >>> 7 & 255;
		bytes[11] = (counterVal & 127) << 1 & 255;
		bytes[12] |= randomBytes[0] & 127;
		bytes[13] = randomBytes[1];
		bytes[14] = randomBytes[2];
		bytes[15] = randomBytes[3];
		bytes[6] = bytes[6] & 15 | 112;
		bytes[8] = bytes[8] & 63 | 128;
		return new _Uuid(_Uuid.bytesToBigInt(bytes));
	}
	/**
	* Parse a UUID from a string representation.
	*
	* @param s - UUID string
	* @returns Parsed UUID
	* @throws {Error} If the string is not a valid UUID
	*
	* @example
	* ```ts
	* const s = "01888d6e-5c00-7000-8000-000000000000";
	* const uuid = Uuid.parse(s);
	*
	* console.assert(uuid.toString() === s);
	* ```
	*/
	static parse(s) {
		const hex = s.replace(/-/g, "");
		if (hex.length !== 32) throw new Error("Invalid hex UUID");
		let v = 0n;
		for (let i = 0; i < 32; i += 2) v = v << 8n | BigInt(parseInt(hex.slice(i, i + 2), 16));
		return new _Uuid(v);
	}
	/** Convert to hex string without a 0x prefix. */
	toHexString() {
		return u128ToHexString(this.asBigInt());
	}
	/** Convert to string (hyphenated form). */
	toString() {
		const hex = this.toHexString();
		return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20);
	}
	/** Convert to bigint (u128). */
	asBigInt() {
		return this.__uuid__;
	}
	/** Return a `Uint8Array` of 16 bytes. */
	toBytes() {
		return _Uuid.bigIntToBytes(this.__uuid__);
	}
	static bytesToBigInt(bytes) {
		let result = 0n;
		for (const b of bytes) result = result << 8n | BigInt(b);
		return result;
	}
	static bigIntToBytes(value) {
		const bytes = new Uint8Array(16);
		for (let i = 15; i >= 0; i--) {
			bytes[i] = Number(value & 255n);
			value >>= 8n;
		}
		return bytes;
	}
	/**
	* Returns the version of this UUID.
	*
	* This represents the algorithm used to generate the value.
	*
	* @returns A `UuidVersion`
	* @throws {Error} If the version field is not recognized
	*/
	getVersion() {
		const version = this.toBytes()[6] >> 4 & 15;
		switch (version) {
			case 4: return "V4";
			case 7: return "V7";
			default:
				if (this == _Uuid.NIL) return "Nil";
				if (this == _Uuid.MAX) return "Max";
				throw new Error(`Unsupported UUID version: ${version}`);
		}
	}
	/**
	* Extract the monotonic counter from a UUIDv7.
	*
	* Intended for testing and diagnostics.
	* Behavior is undefined if called on a non-V7 UUID.
	*
	* @returns 31-bit counter value
	*/
	getCounter() {
		const bytes = this.toBytes();
		const high = bytes[7];
		const mid1 = bytes[9];
		const mid2 = bytes[10];
		const low = bytes[11] >>> 1;
		return high << 23 | mid1 << 15 | mid2 << 7 | low | 0;
	}
	compareTo(other) {
		if (this.__uuid__ < other.__uuid__) return -1;
		if (this.__uuid__ > other.__uuid__) return 1;
		return 0;
	}
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__uuid__",
			algebraicType: AlgebraicType.U128
		}] });
	}
};
var ConnectionId = class _ConnectionId {
	__connection_id__;
	/**
	* Creates a new `ConnectionId`.
	*/
	constructor(data) {
		this.__connection_id__ = coerceToBigInt(data, "ConnectionId");
	}
	/**
	* Get the algebraic type representation of the {@link ConnectionId} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__connection_id__",
			algebraicType: AlgebraicType.U128
		}] });
	}
	isZero() {
		return this.__connection_id__ === BigInt(0);
	}
	static nullIfZero(addr) {
		if (addr.isZero()) return null;
		else return addr;
	}
	static random() {
		function randomU8() {
			return Math.floor(Math.random() * 255);
		}
		let result = BigInt(0);
		for (let i = 0; i < 16; i++) result = result << BigInt(8) | BigInt(randomU8());
		return new _ConnectionId(result);
	}
	/**
	* Compare two connection IDs for equality.
	*/
	isEqual(other) {
		return this.__connection_id__ == other.__connection_id__;
	}
	/**
	* Check if two connection IDs are equal.
	*/
	equals(other) {
		return this.isEqual(other);
	}
	/**
	* Print the connection ID as a hexadecimal string.
	*/
	toHexString() {
		return u128ToHexString(this.__connection_id__);
	}
	/**
	* Convert the connection ID to a Uint8Array.
	*/
	toUint8Array() {
		return u128ToUint8Array(this.__connection_id__);
	}
	/**
	* Parse a connection ID from a hexadecimal string.
	*/
	static fromString(str) {
		return new _ConnectionId(hexStringToU128(str));
	}
	static fromStringOrNull(str) {
		const addr = _ConnectionId.fromString(str);
		if (addr.isZero()) return null;
		else return addr;
	}
};
var Identity = class _Identity {
	__identity__;
	/**
	* Creates a new `Identity`.
	*
	* `data` can be a hexadecimal string or a `bigint`.
	*/
	constructor(data) {
		this.__identity__ = typeof data === "string" ? hexStringToU256(data) : coerceToBigInt(data, "Identity");
	}
	/**
	* Get the algebraic type representation of the {@link Identity} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__identity__",
			algebraicType: AlgebraicType.U256
		}] });
	}
	/**
	* Check if two identities are equal.
	*/
	isEqual(other) {
		return this.toHexString() === other.toHexString();
	}
	/**
	* Check if two identities are equal.
	*/
	equals(other) {
		return this.isEqual(other);
	}
	/**
	* Print the identity as a hexadecimal string.
	*/
	toHexString() {
		return u256ToHexString(this.__identity__);
	}
	/**
	* Convert the address to a Uint8Array.
	*/
	toUint8Array() {
		return u256ToUint8Array(this.__identity__);
	}
	/**
	* Parse an Identity from a hexadecimal string.
	*/
	static fromString(str) {
		return new _Identity(str);
	}
	/**
	* Zero identity (0x0000000000000000000000000000000000000000000000000000000000000000)
	*/
	static zero() {
		return new _Identity(0n);
	}
	toString() {
		return this.toHexString();
	}
};
var SERIALIZERS = /* @__PURE__ */ new Map();
var DESERIALIZERS = /* @__PURE__ */ new Map();
var AlgebraicType = {
	Ref: (value) => ({
		tag: "Ref",
		value
	}),
	Sum: (value) => ({
		tag: "Sum",
		value
	}),
	Product: (value) => ({
		tag: "Product",
		value
	}),
	Array: (value) => ({
		tag: "Array",
		value
	}),
	String: { tag: "String" },
	Bool: { tag: "Bool" },
	I8: { tag: "I8" },
	U8: { tag: "U8" },
	I16: { tag: "I16" },
	U16: { tag: "U16" },
	I32: { tag: "I32" },
	U32: { tag: "U32" },
	I64: { tag: "I64" },
	U64: { tag: "U64" },
	I128: { tag: "I128" },
	U128: { tag: "U128" },
	I256: { tag: "I256" },
	U256: { tag: "U256" },
	F32: { tag: "F32" },
	F64: { tag: "F64" },
	makeSerializer(ty, typespace) {
		if (ty.tag === "Ref") {
			if (!typespace) throw new Error("cannot serialize refs without a typespace");
			while (ty.tag === "Ref") ty = typespace.types[ty.value];
		}
		switch (ty.tag) {
			case "Product": return ProductType.makeSerializer(ty.value, typespace);
			case "Sum": return SumType.makeSerializer(ty.value, typespace);
			case "Array": if (ty.value.tag === "U8") return serializeUint8Array;
			else {
				const serialize = AlgebraicType.makeSerializer(ty.value, typespace);
				return (writer, value) => {
					writer.writeU32(value.length);
					for (const elem of value) serialize(writer, elem);
				};
			}
			default: return primitiveSerializers[ty.tag];
		}
	},
	serializeValue(writer, ty, value, typespace) {
		AlgebraicType.makeSerializer(ty, typespace)(writer, value);
	},
	makeDeserializer(ty, typespace) {
		if (ty.tag === "Ref") {
			if (!typespace) throw new Error("cannot deserialize refs without a typespace");
			while (ty.tag === "Ref") ty = typespace.types[ty.value];
		}
		switch (ty.tag) {
			case "Product": return ProductType.makeDeserializer(ty.value, typespace);
			case "Sum": return SumType.makeDeserializer(ty.value, typespace);
			case "Array": if (ty.value.tag === "U8") return deserializeUint8Array;
			else {
				const deserialize = AlgebraicType.makeDeserializer(ty.value, typespace);
				return (reader) => {
					const length = reader.readU32();
					const result = Array(length);
					for (let i = 0; i < length; i++) result[i] = deserialize(reader);
					return result;
				};
			}
			default: return primitiveDeserializers[ty.tag];
		}
	},
	deserializeValue(reader, ty, typespace) {
		return AlgebraicType.makeDeserializer(ty, typespace)(reader);
	},
	intoMapKey: function(ty, value) {
		switch (ty.tag) {
			case "U8":
			case "U16":
			case "U32":
			case "U64":
			case "U128":
			case "U256":
			case "I8":
			case "I16":
			case "I32":
			case "I64":
			case "I128":
			case "I256":
			case "F32":
			case "F64":
			case "String":
			case "Bool": return value;
			case "Product": return ProductType.intoMapKey(ty.value, value);
			default: {
				const writer = new BinaryWriter(10);
				AlgebraicType.serializeValue(writer, ty, value);
				return writer.toBase64();
			}
		}
	}
};
function bindCall(f) {
	return Function.prototype.call.bind(f);
}
var primitiveSerializers = {
	Bool: bindCall(BinaryWriter.prototype.writeBool),
	I8: bindCall(BinaryWriter.prototype.writeI8),
	U8: bindCall(BinaryWriter.prototype.writeU8),
	I16: bindCall(BinaryWriter.prototype.writeI16),
	U16: bindCall(BinaryWriter.prototype.writeU16),
	I32: bindCall(BinaryWriter.prototype.writeI32),
	U32: bindCall(BinaryWriter.prototype.writeU32),
	I64: bindCall(BinaryWriter.prototype.writeI64),
	U64: bindCall(BinaryWriter.prototype.writeU64),
	I128: bindCall(BinaryWriter.prototype.writeI128),
	U128: bindCall(BinaryWriter.prototype.writeU128),
	I256: bindCall(BinaryWriter.prototype.writeI256),
	U256: bindCall(BinaryWriter.prototype.writeU256),
	F32: bindCall(BinaryWriter.prototype.writeF32),
	F64: bindCall(BinaryWriter.prototype.writeF64),
	String: bindCall(BinaryWriter.prototype.writeString)
};
Object.freeze(primitiveSerializers);
var serializeUint8Array = bindCall(BinaryWriter.prototype.writeUInt8Array);
var primitiveDeserializers = {
	Bool: bindCall(BinaryReader.prototype.readBool),
	I8: bindCall(BinaryReader.prototype.readI8),
	U8: bindCall(BinaryReader.prototype.readU8),
	I16: bindCall(BinaryReader.prototype.readI16),
	U16: bindCall(BinaryReader.prototype.readU16),
	I32: bindCall(BinaryReader.prototype.readI32),
	U32: bindCall(BinaryReader.prototype.readU32),
	I64: bindCall(BinaryReader.prototype.readI64),
	U64: bindCall(BinaryReader.prototype.readU64),
	I128: bindCall(BinaryReader.prototype.readI128),
	U128: bindCall(BinaryReader.prototype.readU128),
	I256: bindCall(BinaryReader.prototype.readI256),
	U256: bindCall(BinaryReader.prototype.readU256),
	F32: bindCall(BinaryReader.prototype.readF32),
	F64: bindCall(BinaryReader.prototype.readF64),
	String: bindCall(BinaryReader.prototype.readString)
};
Object.freeze(primitiveDeserializers);
var deserializeUint8Array = bindCall(BinaryReader.prototype.readUInt8Array);
var primitiveSizes = {
	Bool: 1,
	I8: 1,
	U8: 1,
	I16: 2,
	U16: 2,
	I32: 4,
	U32: 4,
	I64: 8,
	U64: 8,
	I128: 16,
	U128: 16,
	I256: 32,
	U256: 32,
	F32: 4,
	F64: 8
};
var fixedSizePrimitives = new Set(Object.keys(primitiveSizes));
var isFixedSizeProduct = (ty) => ty.elements.every(({ algebraicType }) => fixedSizePrimitives.has(algebraicType.tag));
var productSize = (ty) => ty.elements.reduce((acc, { algebraicType }) => acc + primitiveSizes[algebraicType.tag], 0);
var primitiveJSName = {
	Bool: "Uint8",
	I8: "Int8",
	U8: "Uint8",
	I16: "Int16",
	U16: "Uint16",
	I32: "Int32",
	U32: "Uint32",
	I64: "BigInt64",
	U64: "BigUint64",
	F32: "Float32",
	F64: "Float64"
};
var specialProductDeserializers = {
	__time_duration_micros__: (reader) => new TimeDuration(reader.readI64()),
	__timestamp_micros_since_unix_epoch__: (reader) => new Timestamp(reader.readI64()),
	__identity__: (reader) => new Identity(reader.readU256()),
	__connection_id__: (reader) => new ConnectionId(reader.readU128()),
	__uuid__: (reader) => new Uuid(reader.readU128())
};
Object.freeze(specialProductDeserializers);
var unitDeserializer = () => ({});
var getElementInitializer = (element) => {
	let init;
	switch (element.algebraicType.tag) {
		case "String":
			init = "''";
			break;
		case "Bool":
			init = "false";
			break;
		case "I8":
		case "U8":
		case "I16":
		case "U16":
		case "I32":
		case "U32":
			init = "0";
			break;
		case "I64":
		case "U64":
		case "I128":
		case "U128":
		case "I256":
		case "U256":
			init = "0n";
			break;
		case "F32":
		case "F64":
			init = "0.0";
			break;
		default: init = "undefined";
	}
	return `${element.name}: ${init}`;
};
var ProductType = {
	makeSerializer(ty, typespace) {
		let serializer = SERIALIZERS.get(ty);
		if (serializer != null) return serializer;
		if (isFixedSizeProduct(ty)) {
			const body2 = `"use strict";
writer.expandBuffer(${productSize(ty)});
const view = writer.view;
${ty.elements.map(({ name, algebraicType: { tag } }) => tag in primitiveJSName ? `view.set${primitiveJSName[tag]}(writer.offset, value.${name}, ${primitiveSizes[tag] > 1 ? "true" : ""});
writer.offset += ${primitiveSizes[tag]};` : `writer.write${tag}(value.${name});`).join("\n")}`;
			serializer = Function("writer", "value", body2);
			SERIALIZERS.set(ty, serializer);
			return serializer;
		}
		const serializers = {};
		const body = "\"use strict\";\n" + ty.elements.map((element) => `this.${element.name}(writer, value.${element.name});`).join("\n");
		serializer = Function("writer", "value", body).bind(serializers);
		SERIALIZERS.set(ty, serializer);
		for (const { name, algebraicType } of ty.elements) serializers[name] = AlgebraicType.makeSerializer(algebraicType, typespace);
		Object.freeze(serializers);
		return serializer;
	},
	serializeValue(writer, ty, value, typespace) {
		ProductType.makeSerializer(ty, typespace)(writer, value);
	},
	makeDeserializer(ty, typespace) {
		switch (ty.elements.length) {
			case 0: return unitDeserializer;
			case 1: {
				const fieldName = ty.elements[0].name;
				if (hasOwn(specialProductDeserializers, fieldName)) return specialProductDeserializers[fieldName];
			}
		}
		let deserializer = DESERIALIZERS.get(ty);
		if (deserializer != null) return deserializer;
		if (isFixedSizeProduct(ty)) {
			const body = `"use strict";
const result = { ${ty.elements.map(getElementInitializer).join(", ")} };
const view = reader.view;
${ty.elements.map(({ name, algebraicType: { tag } }) => tag in primitiveJSName ? tag === "Bool" ? `result.${name} = view.getUint8(reader.offset) !== 0;
reader.offset += 1;` : `result.${name} = view.get${primitiveJSName[tag]}(reader.offset, ${primitiveSizes[tag] > 1 ? "true" : ""});
reader.offset += ${primitiveSizes[tag]};` : `result.${name} = reader.read${tag}();`).join("\n")}
return result;`;
			deserializer = Function("reader", body);
			DESERIALIZERS.set(ty, deserializer);
			return deserializer;
		}
		const deserializers = {};
		deserializer = Function("reader", `"use strict";
const result = { ${ty.elements.map(getElementInitializer).join(", ")} };
${ty.elements.map(({ name }) => `result.${name} = this.${name}(reader);`).join("\n")}
return result;`).bind(deserializers);
		DESERIALIZERS.set(ty, deserializer);
		for (const { name, algebraicType } of ty.elements) deserializers[name] = AlgebraicType.makeDeserializer(algebraicType, typespace);
		Object.freeze(deserializers);
		return deserializer;
	},
	deserializeValue(reader, ty, typespace) {
		return ProductType.makeDeserializer(ty, typespace)(reader);
	},
	intoMapKey(ty, value) {
		if (ty.elements.length === 1) {
			const fieldName = ty.elements[0].name;
			if (hasOwn(specialProductDeserializers, fieldName)) return value[fieldName];
		}
		const writer = new BinaryWriter(10);
		AlgebraicType.serializeValue(writer, AlgebraicType.Product(ty), value);
		return writer.toBase64();
	}
};
var SumType = {
	makeSerializer(ty, typespace) {
		if (ty.variants.length == 2 && ty.variants[0].name === "some" && ty.variants[1].name === "none") {
			const serialize = AlgebraicType.makeSerializer(ty.variants[0].algebraicType, typespace);
			return (writer, value) => {
				if (value !== null && value !== void 0) {
					writer.writeByte(0);
					serialize(writer, value);
				} else writer.writeByte(1);
			};
		} else if (ty.variants.length == 2 && ty.variants[0].name === "ok" && ty.variants[1].name === "err") {
			const serializeOk = AlgebraicType.makeSerializer(ty.variants[0].algebraicType, typespace);
			const serializeErr = AlgebraicType.makeSerializer(ty.variants[1].algebraicType, typespace);
			return (writer, value) => {
				if ("ok" in value) {
					writer.writeU8(0);
					serializeOk(writer, value.ok);
				} else if ("err" in value) {
					writer.writeU8(1);
					serializeErr(writer, value.err);
				} else throw new TypeError("could not serialize result: object had neither a `ok` nor an `err` field");
			};
		} else {
			let serializer = SERIALIZERS.get(ty);
			if (serializer != null) return serializer;
			const serializers = {};
			const body = `switch (value.tag) {
${ty.variants.map(({ name }, i) => `  case ${JSON.stringify(name)}:
    writer.writeByte(${i});
    return this.${name}(writer, value.value);`).join("\n")}
  default:
    throw new TypeError(
      \`Could not serialize sum type; unknown tag \${value.tag}\`
    )
}
`;
			serializer = Function("writer", "value", body).bind(serializers);
			SERIALIZERS.set(ty, serializer);
			for (const { name, algebraicType } of ty.variants) serializers[name] = AlgebraicType.makeSerializer(algebraicType, typespace);
			Object.freeze(serializers);
			return serializer;
		}
	},
	serializeValue(writer, ty, value, typespace) {
		SumType.makeSerializer(ty, typespace)(writer, value);
	},
	makeDeserializer(ty, typespace) {
		if (ty.variants.length == 2 && ty.variants[0].name === "some" && ty.variants[1].name === "none") {
			const deserialize = AlgebraicType.makeDeserializer(ty.variants[0].algebraicType, typespace);
			return (reader) => {
				const tag = reader.readU8();
				if (tag === 0) return deserialize(reader);
				else if (tag === 1) return;
				else throw `Can't deserialize an option type, couldn't find ${tag} tag`;
			};
		} else if (ty.variants.length == 2 && ty.variants[0].name === "ok" && ty.variants[1].name === "err") {
			const deserializeOk = AlgebraicType.makeDeserializer(ty.variants[0].algebraicType, typespace);
			const deserializeErr = AlgebraicType.makeDeserializer(ty.variants[1].algebraicType, typespace);
			return (reader) => {
				const tag = reader.readByte();
				if (tag === 0) return { ok: deserializeOk(reader) };
				else if (tag === 1) return { err: deserializeErr(reader) };
				else throw `Can't deserialize a result type, couldn't find ${tag} tag`;
			};
		} else {
			let deserializer = DESERIALIZERS.get(ty);
			if (deserializer != null) return deserializer;
			const deserializers = {};
			deserializer = Function("reader", `switch (reader.readU8()) {
${ty.variants.map(({ name }, i) => `case ${i}: return { tag: ${JSON.stringify(name)}, value: this.${name}(reader) };`).join("\n")} }`).bind(deserializers);
			DESERIALIZERS.set(ty, deserializer);
			for (const { name, algebraicType } of ty.variants) deserializers[name] = AlgebraicType.makeDeserializer(algebraicType, typespace);
			Object.freeze(deserializers);
			return deserializer;
		}
	},
	deserializeValue(reader, ty, typespace) {
		return SumType.makeDeserializer(ty, typespace)(reader);
	}
};
var Option = { getAlgebraicType(innerType) {
	return AlgebraicType.Sum({ variants: [{
		name: "some",
		algebraicType: innerType
	}, {
		name: "none",
		algebraicType: AlgebraicType.Product({ elements: [] })
	}] });
} };
var Result = { getAlgebraicType(okType, errType) {
	return AlgebraicType.Sum({ variants: [{
		name: "ok",
		algebraicType: okType
	}, {
		name: "err",
		algebraicType: errType
	}] });
} };
var ScheduleAt = {
	interval(value) {
		return Interval(value);
	},
	time(value) {
		return Time(value);
	},
	getAlgebraicType() {
		return AlgebraicType.Sum({ variants: [{
			name: "Interval",
			algebraicType: TimeDuration.getAlgebraicType()
		}, {
			name: "Time",
			algebraicType: Timestamp.getAlgebraicType()
		}] });
	},
	isScheduleAt(algebraicType) {
		if (algebraicType.tag !== "Sum") return false;
		const variants = algebraicType.value.variants;
		if (variants.length !== 2) return false;
		const intervalVariant = variants.find((v) => v.name === "Interval");
		const timeVariant = variants.find((v) => v.name === "Time");
		if (!intervalVariant || !timeVariant) return false;
		return TimeDuration.isTimeDuration(intervalVariant.algebraicType) && Timestamp.isTimestamp(timeVariant.algebraicType);
	}
};
var Interval = (micros) => ({
	tag: "Interval",
	value: new TimeDuration(micros)
});
var Time = (microsSinceUnixEpoch) => ({
	tag: "Time",
	value: new Timestamp(microsSinceUnixEpoch)
});
var schedule_at_default = ScheduleAt;
function set(x, t2) {
	return {
		...x,
		...t2
	};
}
var TypeBuilder = class {
	/**
	* The TypeScript phantom type. This is not stored at runtime,
	* but is visible to the compiler
	*/
	type;
	/**
	* The SpacetimeDB algebraic type (run‑time value). In addition to storing
	* the runtime representation of the `AlgebraicType`, it also captures
	* the TypeScript type information of the `AlgebraicType`. That is to say
	* the value is not merely an `AlgebraicType`, but is constructed to be
	* the corresponding concrete `AlgebraicType` for the TypeScript type `Type`.
	*
	* e.g. `string` corresponds to `AlgebraicType.String`
	*/
	algebraicType;
	constructor(algebraicType) {
		this.algebraicType = algebraicType;
	}
	optional() {
		return new OptionBuilder(this);
	}
	serialize(writer, value) {
		(this.serialize = AlgebraicType.makeSerializer(this.algebraicType))(writer, value);
	}
	deserialize(reader) {
		return (this.deserialize = AlgebraicType.makeDeserializer(this.algebraicType))(reader);
	}
};
var U8Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U8);
	}
	index(algorithm = "btree") {
		return new U8ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U8ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U8ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U8ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U8ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U8ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U16Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U16);
	}
	index(algorithm = "btree") {
		return new U16ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U16ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U16ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U16ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U16ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U16ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U32Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U32);
	}
	index(algorithm = "btree") {
		return new U32ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U32ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U32ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U32ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U32ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U32ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U64Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U64);
	}
	index(algorithm = "btree") {
		return new U64ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U64ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U64ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U64ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U64ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U64ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U128Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U128);
	}
	index(algorithm = "btree") {
		return new U128ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U128ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U128ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U128ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U128ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U128ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U256Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U256);
	}
	index(algorithm = "btree") {
		return new U256ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U256ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U256ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U256ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U256ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U256ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I8Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I8);
	}
	index(algorithm = "btree") {
		return new I8ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I8ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I8ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I8ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I8ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I8ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I16Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I16);
	}
	index(algorithm = "btree") {
		return new I16ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I16ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I16ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I16ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I16ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I16ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I32Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I32);
	}
	index(algorithm = "btree") {
		return new I32ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I32ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I32ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I32ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I32ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I32ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I64Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I64);
	}
	index(algorithm = "btree") {
		return new I64ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I64ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I64ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I64ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I64ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I64ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I128Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I128);
	}
	index(algorithm = "btree") {
		return new I128ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I128ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I128ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I128ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I128ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I128ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I256Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I256);
	}
	index(algorithm = "btree") {
		return new I256ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I256ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I256ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I256ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I256ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I256ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var F32Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.F32);
	}
	default(value) {
		return new F32ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new F32ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var F64Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.F64);
	}
	default(value) {
		return new F64ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new F64ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var BoolBuilder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.Bool);
	}
	index(algorithm = "btree") {
		return new BoolColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new BoolColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new BoolColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new BoolColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new BoolColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var StringBuilder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.String);
	}
	index(algorithm = "btree") {
		return new StringColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new StringColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new StringColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new StringColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new StringColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ArrayBuilder = class extends TypeBuilder {
	element;
	constructor(element) {
		super(AlgebraicType.Array(element.algebraicType));
		this.element = element;
	}
	default(value) {
		return new ArrayColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ArrayColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ByteArrayBuilder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.Array(AlgebraicType.U8));
	}
	default(value) {
		return new ByteArrayColumnBuilder(set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ByteArrayColumnBuilder(set(defaultMetadata, { name }));
	}
};
var OptionBuilder = class extends TypeBuilder {
	value;
	constructor(value) {
		super(Option.getAlgebraicType(value.algebraicType));
		this.value = value;
	}
	default(value) {
		return new OptionColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new OptionColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ProductBuilder = class extends TypeBuilder {
	typeName;
	elements;
	constructor(elements, name) {
		function elementsArrayFromElementsObj(obj) {
			return Object.keys(obj).map((key) => ({
				name: key,
				get algebraicType() {
					return obj[key].algebraicType;
				}
			}));
		}
		super(AlgebraicType.Product({ elements: elementsArrayFromElementsObj(elements) }));
		this.typeName = name;
		this.elements = elements;
	}
	default(value) {
		return new ProductColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ProductColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ResultBuilder = class extends TypeBuilder {
	ok;
	err;
	constructor(ok, err) {
		super(Result.getAlgebraicType(ok.algebraicType, err.algebraicType));
		this.ok = ok;
		this.err = err;
	}
	default(value) {
		return new ResultColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
};
var UnitBuilder = class extends TypeBuilder {
	constructor() {
		super({
			tag: "Product",
			value: { elements: [] }
		});
	}
};
var RowBuilder = class extends TypeBuilder {
	row;
	typeName;
	constructor(row, name) {
		const mappedRow = Object.fromEntries(Object.entries(row).map(([colName, builder]) => [colName, builder instanceof ColumnBuilder ? builder : new ColumnBuilder(builder, {})]));
		const elements = Object.keys(mappedRow).map((name2) => ({
			name: name2,
			get algebraicType() {
				return mappedRow[name2].typeBuilder.algebraicType;
			}
		}));
		super(AlgebraicType.Product({ elements }));
		this.row = mappedRow;
		this.typeName = name;
	}
};
var SumBuilderImpl = class extends TypeBuilder {
	variants;
	typeName;
	constructor(variants, name) {
		function variantsArrayFromVariantsObj(variants2) {
			return Object.keys(variants2).map((key) => ({
				name: key,
				get algebraicType() {
					return variants2[key].algebraicType;
				}
			}));
		}
		super(AlgebraicType.Sum({ variants: variantsArrayFromVariantsObj(variants) }));
		this.variants = variants;
		this.typeName = name;
		for (const key of Object.keys(variants)) {
			const desc = Object.getOwnPropertyDescriptor(variants, key);
			const isAccessor = !!desc && (typeof desc.get === "function" || typeof desc.set === "function");
			let isUnit2 = false;
			if (!isAccessor) isUnit2 = variants[key] instanceof UnitBuilder;
			if (isUnit2) {
				const constant = this.create(key);
				Object.defineProperty(this, key, {
					value: constant,
					writable: false,
					enumerable: true,
					configurable: false
				});
			} else {
				const fn = ((value) => this.create(key, value));
				Object.defineProperty(this, key, {
					value: fn,
					writable: false,
					enumerable: true,
					configurable: false
				});
			}
		}
	}
	create(tag, value) {
		return value === void 0 ? { tag } : {
			tag,
			value
		};
	}
	default(value) {
		return new SumColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new SumColumnBuilder(this, set(defaultMetadata, { name }));
	}
	index(algorithm = "btree") {
		return new SumColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	primaryKey() {
		return new SumColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
};
var SumBuilder = SumBuilderImpl;
var SimpleSumBuilderImpl = class extends SumBuilderImpl {
	index(algorithm = "btree") {
		return new SimpleSumColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	primaryKey() {
		return new SimpleSumColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
};
var ScheduleAtBuilder = class extends TypeBuilder {
	constructor() {
		super(schedule_at_default.getAlgebraicType());
	}
	default(value) {
		return new ScheduleAtColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ScheduleAtColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var IdentityBuilder = class extends TypeBuilder {
	constructor() {
		super(Identity.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ConnectionIdBuilder = class extends TypeBuilder {
	constructor() {
		super(ConnectionId.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var TimestampBuilder = class extends TypeBuilder {
	constructor() {
		super(Timestamp.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var TimeDurationBuilder = class extends TypeBuilder {
	constructor() {
		super(TimeDuration.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var UuidBuilder = class extends TypeBuilder {
	constructor() {
		super(Uuid.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new UuidColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new UuidColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new UuidColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new UuidColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new UuidColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new UuidColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var defaultMetadata = {};
var ColumnBuilder = class {
	typeBuilder;
	columnMetadata;
	constructor(typeBuilder, metadata) {
		this.typeBuilder = typeBuilder;
		this.columnMetadata = metadata;
	}
	serialize(writer, value) {
		this.typeBuilder.serialize(writer, value);
	}
	deserialize(reader) {
		return this.typeBuilder.deserialize(reader);
	}
};
var U8ColumnBuilder = class _U8ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U16ColumnBuilder = class _U16ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U32ColumnBuilder = class _U32ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U64ColumnBuilder = class _U64ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U128ColumnBuilder = class _U128ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U256ColumnBuilder = class _U256ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I8ColumnBuilder = class _I8ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I16ColumnBuilder = class _I16ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I32ColumnBuilder = class _I32ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I64ColumnBuilder = class _I64ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I128ColumnBuilder = class _I128ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I256ColumnBuilder = class _I256ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var F32ColumnBuilder = class _F32ColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _F32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _F32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var F64ColumnBuilder = class _F64ColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _F64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _F64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var BoolColumnBuilder = class _BoolColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var StringColumnBuilder = class _StringColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ArrayColumnBuilder = class _ArrayColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _ArrayColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ArrayColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ByteArrayColumnBuilder = class _ByteArrayColumnBuilder extends ColumnBuilder {
	constructor(metadata) {
		super(new TypeBuilder(AlgebraicType.Array(AlgebraicType.U8)), metadata);
	}
	default(value) {
		return new _ByteArrayColumnBuilder(set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ByteArrayColumnBuilder(set(this.columnMetadata, { name }));
	}
};
var OptionColumnBuilder = class _OptionColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _OptionColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _OptionColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ResultColumnBuilder = class _ResultColumnBuilder extends ColumnBuilder {
	constructor(typeBuilder, metadata) {
		super(typeBuilder, metadata);
	}
	default(value) {
		return new _ResultColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
};
var ProductColumnBuilder = class _ProductColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _ProductColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ProductColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var SumColumnBuilder = class _SumColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _SumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _SumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
	index(algorithm = "btree") {
		return new _SumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	primaryKey() {
		return new _SumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
};
var SimpleSumColumnBuilder = class _SimpleSumColumnBuilder extends SumColumnBuilder {
	index(algorithm = "btree") {
		return new _SimpleSumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	primaryKey() {
		return new _SimpleSumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
};
var ScheduleAtColumnBuilder = class _ScheduleAtColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _ScheduleAtColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ScheduleAtColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var IdentityColumnBuilder = class _IdentityColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ConnectionIdColumnBuilder = class _ConnectionIdColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var TimestampColumnBuilder = class _TimestampColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var TimeDurationColumnBuilder = class _TimeDurationColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var UuidColumnBuilder = class _UuidColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var RefBuilder = class extends TypeBuilder {
	ref;
	/** The phantom type of the pointee of this ref. */
	__spacetimeType;
	constructor(ref) {
		super(AlgebraicType.Ref(ref));
		this.ref = ref;
	}
};
var enumImpl = ((nameOrObj, maybeObj) => {
	let obj = nameOrObj;
	let name = void 0;
	if (typeof nameOrObj === "string") {
		if (!maybeObj) throw new TypeError("When providing a name, you must also provide the variants object or array.");
		obj = maybeObj;
		name = nameOrObj;
	}
	if (Array.isArray(obj)) {
		const simpleVariantsObj = {};
		for (const variant of obj) simpleVariantsObj[variant] = new UnitBuilder();
		return new SimpleSumBuilderImpl(simpleVariantsObj, name);
	}
	return new SumBuilder(obj, name);
});
var t = {
	bool: () => new BoolBuilder(),
	string: () => new StringBuilder(),
	number: () => new F64Builder(),
	i8: () => new I8Builder(),
	u8: () => new U8Builder(),
	i16: () => new I16Builder(),
	u16: () => new U16Builder(),
	i32: () => new I32Builder(),
	u32: () => new U32Builder(),
	i64: () => new I64Builder(),
	u64: () => new U64Builder(),
	i128: () => new I128Builder(),
	u128: () => new U128Builder(),
	i256: () => new I256Builder(),
	u256: () => new U256Builder(),
	f32: () => new F32Builder(),
	f64: () => new F64Builder(),
	object: ((nameOrObj, maybeObj) => {
		if (typeof nameOrObj === "string") {
			if (!maybeObj) throw new TypeError("When providing a name, you must also provide the object.");
			return new ProductBuilder(maybeObj, nameOrObj);
		}
		return new ProductBuilder(nameOrObj, void 0);
	}),
	row: ((nameOrObj, maybeObj) => {
		const [obj, name] = typeof nameOrObj === "string" ? [maybeObj, nameOrObj] : [nameOrObj, void 0];
		return new RowBuilder(obj, name);
	}),
	array(e) {
		return new ArrayBuilder(e);
	},
	enum: enumImpl,
	unit() {
		return new UnitBuilder();
	},
	lazy(thunk) {
		let cached = null;
		const get = () => cached ??= thunk();
		return new Proxy({}, {
			get(_t, prop, recv) {
				const target = get();
				const val = Reflect.get(target, prop, recv);
				return typeof val === "function" ? val.bind(target) : val;
			},
			set(_t, prop, value, recv) {
				return Reflect.set(get(), prop, value, recv);
			},
			has(_t, prop) {
				return prop in get();
			},
			ownKeys() {
				return Reflect.ownKeys(get());
			},
			getOwnPropertyDescriptor(_t, prop) {
				return Object.getOwnPropertyDescriptor(get(), prop);
			},
			getPrototypeOf() {
				return Object.getPrototypeOf(get());
			}
		});
	},
	scheduleAt: () => {
		return new ScheduleAtBuilder();
	},
	option(value) {
		return new OptionBuilder(value);
	},
	result(ok, err) {
		return new ResultBuilder(ok, err);
	},
	identity: () => {
		return new IdentityBuilder();
	},
	connectionId: () => {
		return new ConnectionIdBuilder();
	},
	timestamp: () => {
		return new TimestampBuilder();
	},
	timeDuration: () => {
		return new TimeDurationBuilder();
	},
	uuid: () => {
		return new UuidBuilder();
	},
	byteArray: () => {
		return new ByteArrayBuilder();
	}
};
var MAX_ENV_KEY_BYTES = 256;
var MAX_ENV_VALUE_BYTES = 8 * 1024;
var MAX_ENV_VARS = 256;
var environment = new Proxy(Object.freeze(Object.assign(/* @__PURE__ */ Object.create(null), { get: (key) => env_get(key) })), { get(target, key) {
	if (key === "get") return target.get;
	if (typeof key !== "string") return void 0;
	return env_get(key) ?? void 0;
} });
function environmentDeclarations(schema2) {
	const entries = Object.entries(schema2);
	if (entries.length > MAX_ENV_VARS) throw new TypeError("Too many environment declarations");
	const bytes = new TextEncoder();
	return entries.map(([name, definition]) => {
		if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name) || bytes.encode(name).length > MAX_ENV_KEY_BYTES) throw new TypeError("Invalid environment declaration name");
		const optional = definition instanceof OptionBuilder;
		const inner = optional ? definition.value : definition;
		let ty;
		if (inner instanceof StringBuilder) ty = { tag: "String" };
		else {
			const type = inner?.algebraicType;
			if (type?.tag !== "Sum" || !("variants" in inner)) throw new TypeError(`Environment '${name}' must be a string or simple enum`);
			const values = type.value.variants.map((variant) => {
				if (variant.algebraicType.tag !== "Product" || variant.algebraicType.value.elements.length !== 0) throw new TypeError(`Environment '${name}' cannot use an enum payload`);
				if (typeof variant.name !== "string") throw new TypeError(`Environment '${name}' enum cases must have names`);
				if (bytes.encode(variant.name).length > MAX_ENV_VALUE_BYTES) throw new TypeError(`Environment '${name}' literal is too long`);
				return variant.name;
			});
			if (values.length === 0 || new Set(values).size !== values.length) throw new TypeError(`Environment '${name}' needs a nonempty literal union`);
			ty = values.length === 1 ? {
				tag: "StringLiteral",
				value: values[0]
			} : {
				tag: "Union",
				value: values
			};
		}
		return {
			name,
			ty,
			optional
		};
	});
}
var AlgebraicType2 = t.enum("AlgebraicType", {
	Ref: t.u32(),
	get Sum() {
		return SumType2;
	},
	get Product() {
		return ProductType2;
	},
	get Array() {
		return AlgebraicType2;
	},
	String: t.unit(),
	Bool: t.unit(),
	I8: t.unit(),
	U8: t.unit(),
	I16: t.unit(),
	U16: t.unit(),
	I32: t.unit(),
	U32: t.unit(),
	I64: t.unit(),
	U64: t.unit(),
	I128: t.unit(),
	U128: t.unit(),
	I256: t.unit(),
	U256: t.unit(),
	F32: t.unit(),
	F64: t.unit()
});
var CaseConversionPolicy = t.enum("CaseConversionPolicy", {
	None: t.unit(),
	SnakeCase: t.unit()
});
var EnvVarType = t.enum("EnvVarType", {
	String: t.unit(),
	StringLiteral: t.string(),
	Union: t.array(t.string())
});
var EnvironmentDeclaration = t.object("EnvironmentDeclaration", {
	name: t.string(),
	get ty() {
		return EnvVarType;
	},
	optional: t.bool()
});
var ExplicitNameEntry = t.enum("ExplicitNameEntry", {
	get Table() {
		return NameMapping;
	},
	get Function() {
		return NameMapping;
	},
	get Index() {
		return NameMapping;
	},
	get Namespace() {
		return NameMapping;
	}
});
var ExplicitNames = t.object("ExplicitNames", { get entries() {
	return t.array(ExplicitNameEntry);
} });
var FunctionVisibility = t.enum("FunctionVisibility", {
	Private: t.unit(),
	ClientCallable: t.unit()
});
var HttpHeaderPair = t.object("HttpHeaderPair", {
	name: t.string(),
	value: t.byteArray()
});
var HttpHeaders = t.object("HttpHeaders", { get entries() {
	return t.array(HttpHeaderPair);
} });
var HttpMethod = t.enum("HttpMethod", {
	Get: t.unit(),
	Head: t.unit(),
	Post: t.unit(),
	Put: t.unit(),
	Delete: t.unit(),
	Connect: t.unit(),
	Options: t.unit(),
	Trace: t.unit(),
	Patch: t.unit(),
	Extension: t.string()
});
var HttpRequest = t.object("HttpRequest", {
	get method() {
		return HttpMethod;
	},
	get headers() {
		return HttpHeaders;
	},
	timeout: t.option(t.timeDuration()),
	uri: t.string(),
	get version() {
		return HttpVersion;
	}
});
var HttpResponse = t.object("HttpResponse", {
	get headers() {
		return HttpHeaders;
	},
	get version() {
		return HttpVersion;
	},
	code: t.u16()
});
var HttpVersion = t.enum("HttpVersion", {
	Http09: t.unit(),
	Http10: t.unit(),
	Http11: t.unit(),
	Http2: t.unit(),
	Http3: t.unit()
});
var IndexType = t.enum("IndexType", {
	BTree: t.unit(),
	Hash: t.unit()
});
var Lifecycle = t.enum("Lifecycle", {
	Init: t.unit(),
	OnConnect: t.unit(),
	OnDisconnect: t.unit()
});
var MethodOrAny = t.enum("MethodOrAny", {
	Any: t.unit(),
	get Method() {
		return HttpMethod;
	}
});
var MiscModuleExport = t.enum("MiscModuleExport", { get TypeAlias() {
	return TypeAlias;
} });
var NameMapping = t.object("NameMapping", {
	sourceName: t.string(),
	canonicalName: t.string()
});
var ProductType2 = t.object("ProductType", { get elements() {
	return t.array(ProductTypeElement);
} });
var ProductTypeElement = t.object("ProductTypeElement", {
	name: t.option(t.string()),
	get algebraicType() {
		return AlgebraicType2;
	}
});
var RawColumnDefV8 = t.object("RawColumnDefV8", {
	colName: t.string(),
	get colType() {
		return AlgebraicType2;
	}
});
var RawColumnDefaultValueV10 = t.object("RawColumnDefaultValueV10", {
	colId: t.u16(),
	value: t.byteArray()
});
var RawColumnDefaultValueV9 = t.object("RawColumnDefaultValueV9", {
	table: t.string(),
	colId: t.u16(),
	value: t.byteArray()
});
var RawConstraintDataV9 = t.enum("RawConstraintDataV9", { get Unique() {
	return RawUniqueConstraintDataV9;
} });
var RawConstraintDefV10 = t.object("RawConstraintDefV10", {
	sourceName: t.option(t.string()),
	get data() {
		return RawConstraintDataV9;
	}
});
var RawConstraintDefV8 = t.object("RawConstraintDefV8", {
	constraintName: t.string(),
	constraints: t.u8(),
	columns: t.array(t.u16())
});
var RawConstraintDefV9 = t.object("RawConstraintDefV9", {
	name: t.option(t.string()),
	get data() {
		return RawConstraintDataV9;
	}
});
var RawHttpHandlerDefV10 = t.object("RawHttpHandlerDefV10", { sourceName: t.string() });
var RawHttpRouteDefV10 = t.object("RawHttpRouteDefV10", {
	handlerFunction: t.string(),
	get method() {
		return MethodOrAny;
	},
	path: t.string()
});
var RawIndexAlgorithm = t.enum("RawIndexAlgorithm", {
	BTree: t.array(t.u16()),
	Hash: t.array(t.u16()),
	Direct: t.u16()
});
var RawIndexDefV10 = t.object("RawIndexDefV10", {
	sourceName: t.option(t.string()),
	accessorName: t.option(t.string()),
	get algorithm() {
		return RawIndexAlgorithm;
	}
});
var RawIndexDefV8 = t.object("RawIndexDefV8", {
	indexName: t.string(),
	isUnique: t.bool(),
	get indexType() {
		return IndexType;
	},
	columns: t.array(t.u16())
});
var RawIndexDefV9 = t.object("RawIndexDefV9", {
	name: t.option(t.string()),
	accessorName: t.option(t.string()),
	get algorithm() {
		return RawIndexAlgorithm;
	}
});
var RawLifeCycleReducerDefV10 = t.object("RawLifeCycleReducerDefV10", {
	get lifecycleSpec() {
		return Lifecycle;
	},
	functionName: t.string()
});
var RawMiscModuleExportV9 = t.enum("RawMiscModuleExportV9", {
	get ColumnDefaultValue() {
		return RawColumnDefaultValueV9;
	},
	get Procedure() {
		return RawProcedureDefV9;
	},
	get View() {
		return RawViewDefV9;
	}
});
var RawModuleDef = t.enum("RawModuleDef", {
	get V8BackCompat() {
		return RawModuleDefV8;
	},
	get V9() {
		return RawModuleDefV9;
	},
	get V10() {
		return RawModuleDefV10;
	}
});
var RawModuleDefV10 = t.object("RawModuleDefV10", { get sections() {
	return t.array(RawModuleDefV10Section);
} });
var RawModuleDefV10Section = t.enum("RawModuleDefV10Section", {
	get Typespace() {
		return Typespace;
	},
	get Types() {
		return t.array(RawTypeDefV10);
	},
	get Tables() {
		return t.array(RawTableDefV10);
	},
	get Reducers() {
		return t.array(RawReducerDefV10);
	},
	get Procedures() {
		return t.array(RawProcedureDefV10);
	},
	get Views() {
		return t.array(RawViewDefV10);
	},
	get Schedules() {
		return t.array(RawScheduleDefV10);
	},
	get LifeCycleReducers() {
		return t.array(RawLifeCycleReducerDefV10);
	},
	get RowLevelSecurity() {
		return t.array(RawRowLevelSecurityDefV9);
	},
	get CaseConversionPolicy() {
		return CaseConversionPolicy;
	},
	get ExplicitNames() {
		return ExplicitNames;
	},
	get HttpHandlers() {
		return t.array(RawHttpHandlerDefV10);
	},
	get HttpRoutes() {
		return t.array(RawHttpRouteDefV10);
	},
	get ViewPrimaryKeys() {
		return t.array(RawViewPrimaryKeyDefV10);
	},
	get Submodules() {
		return t.array(RawSubmoduleV10);
	},
	get Environment() {
		return t.array(EnvironmentDeclaration);
	}
});
var RawModuleDefV8 = t.object("RawModuleDefV8", {
	get typespace() {
		return Typespace;
	},
	get tables() {
		return t.array(TableDesc);
	},
	get reducers() {
		return t.array(ReducerDef);
	},
	get miscExports() {
		return t.array(MiscModuleExport);
	}
});
var RawModuleDefV9 = t.object("RawModuleDefV9", {
	get typespace() {
		return Typespace;
	},
	get tables() {
		return t.array(RawTableDefV9);
	},
	get reducers() {
		return t.array(RawReducerDefV9);
	},
	get types() {
		return t.array(RawTypeDefV9);
	},
	get miscExports() {
		return t.array(RawMiscModuleExportV9);
	},
	get rowLevelSecurity() {
		return t.array(RawRowLevelSecurityDefV9);
	}
});
var RawProcedureDefV10 = t.object("RawProcedureDefV10", {
	sourceName: t.string(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	},
	get visibility() {
		return FunctionVisibility;
	}
});
var RawProcedureDefV9 = t.object("RawProcedureDefV9", {
	name: t.string(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	}
});
var RawReducerDefV10 = t.object("RawReducerDefV10", {
	sourceName: t.string(),
	get params() {
		return ProductType2;
	},
	get visibility() {
		return FunctionVisibility;
	},
	get okReturnType() {
		return AlgebraicType2;
	},
	get errReturnType() {
		return AlgebraicType2;
	}
});
var RawReducerDefV9 = t.object("RawReducerDefV9", {
	name: t.string(),
	get params() {
		return ProductType2;
	},
	get lifecycle() {
		return t.option(Lifecycle);
	}
});
var RawRowLevelSecurityDefV9 = t.object("RawRowLevelSecurityDefV9", { sql: t.string() });
var RawScheduleDefV10 = t.object("RawScheduleDefV10", {
	sourceName: t.option(t.string()),
	tableName: t.string(),
	scheduleAtCol: t.u16(),
	functionName: t.string()
});
var RawScheduleDefV9 = t.object("RawScheduleDefV9", {
	name: t.option(t.string()),
	reducerName: t.string(),
	scheduledAtColumn: t.u16()
});
var RawScopedTypeNameV10 = t.object("RawScopedTypeNameV10", {
	scope: t.array(t.string()),
	sourceName: t.string()
});
var RawScopedTypeNameV9 = t.object("RawScopedTypeNameV9", {
	scope: t.array(t.string()),
	name: t.string()
});
var RawSequenceDefV10 = t.object("RawSequenceDefV10", {
	sourceName: t.option(t.string()),
	column: t.u16(),
	start: t.option(t.i128()),
	minValue: t.option(t.i128()),
	maxValue: t.option(t.i128()),
	increment: t.i128()
});
var RawSequenceDefV8 = t.object("RawSequenceDefV8", {
	sequenceName: t.string(),
	colPos: t.u16(),
	increment: t.i128(),
	start: t.option(t.i128()),
	minValue: t.option(t.i128()),
	maxValue: t.option(t.i128()),
	allocated: t.i128()
});
var RawSequenceDefV9 = t.object("RawSequenceDefV9", {
	name: t.option(t.string()),
	column: t.u16(),
	start: t.option(t.i128()),
	minValue: t.option(t.i128()),
	maxValue: t.option(t.i128()),
	increment: t.i128()
});
var RawSubmoduleV10 = t.object("RawSubmoduleV10", {
	namespace: t.string(),
	get module() {
		return RawModuleDefV10;
	}
});
var RawTableDefV10 = t.object("RawTableDefV10", {
	sourceName: t.string(),
	productTypeRef: t.u32(),
	primaryKey: t.array(t.u16()),
	get indexes() {
		return t.array(RawIndexDefV10);
	},
	get constraints() {
		return t.array(RawConstraintDefV10);
	},
	get sequences() {
		return t.array(RawSequenceDefV10);
	},
	get tableType() {
		return TableType;
	},
	get tableAccess() {
		return TableAccess;
	},
	get defaultValues() {
		return t.array(RawColumnDefaultValueV10);
	},
	isEvent: t.bool()
});
var RawTableDefV8 = t.object("RawTableDefV8", {
	tableName: t.string(),
	get columns() {
		return t.array(RawColumnDefV8);
	},
	get indexes() {
		return t.array(RawIndexDefV8);
	},
	get constraints() {
		return t.array(RawConstraintDefV8);
	},
	get sequences() {
		return t.array(RawSequenceDefV8);
	},
	tableType: t.string(),
	tableAccess: t.string(),
	scheduled: t.option(t.string())
});
var RawTableDefV9 = t.object("RawTableDefV9", {
	name: t.string(),
	productTypeRef: t.u32(),
	primaryKey: t.array(t.u16()),
	get indexes() {
		return t.array(RawIndexDefV9);
	},
	get constraints() {
		return t.array(RawConstraintDefV9);
	},
	get sequences() {
		return t.array(RawSequenceDefV9);
	},
	get schedule() {
		return t.option(RawScheduleDefV9);
	},
	get tableType() {
		return TableType;
	},
	get tableAccess() {
		return TableAccess;
	}
});
var RawTypeDefV10 = t.object("RawTypeDefV10", {
	get sourceName() {
		return RawScopedTypeNameV10;
	},
	ty: t.u32(),
	customOrdering: t.bool()
});
var RawTypeDefV9 = t.object("RawTypeDefV9", {
	get name() {
		return RawScopedTypeNameV9;
	},
	ty: t.u32(),
	customOrdering: t.bool()
});
var RawUniqueConstraintDataV9 = t.object("RawUniqueConstraintDataV9", { columns: t.array(t.u16()) });
var RawViewDefV10 = t.object("RawViewDefV10", {
	sourceName: t.string(),
	index: t.u32(),
	isPublic: t.bool(),
	isAnonymous: t.bool(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	}
});
var RawViewDefV9 = t.object("RawViewDefV9", {
	name: t.string(),
	index: t.u32(),
	isPublic: t.bool(),
	isAnonymous: t.bool(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	}
});
var RawViewPrimaryKeyDefV10 = t.object("RawViewPrimaryKeyDefV10", {
	viewSourceName: t.string(),
	columns: t.array(t.string())
});
var ReducerDef = t.object("ReducerDef", {
	name: t.string(),
	get args() {
		return t.array(ProductTypeElement);
	}
});
var SumType2 = t.object("SumType", { get variants() {
	return t.array(SumTypeVariant);
} });
var SumTypeVariant = t.object("SumTypeVariant", {
	name: t.option(t.string()),
	get algebraicType() {
		return AlgebraicType2;
	}
});
var TableAccess = t.enum("TableAccess", {
	Public: t.unit(),
	Private: t.unit()
});
var TableDesc = t.object("TableDesc", {
	get schema() {
		return RawTableDefV8;
	},
	data: t.u32()
});
var TableType = t.enum("TableType", {
	System: t.unit(),
	User: t.unit()
});
var TypeAlias = t.object("TypeAlias", {
	name: t.string(),
	ty: t.u32()
});
var Typespace = t.object("Typespace", { get types() {
	return t.array(AlgebraicType2);
} });
var ViewResultHeader = t.enum("ViewResultHeader", {
	RowData: t.unit(),
	RawSql: t.string()
});
function tableToSchema(accName, schema2, tableDef) {
	const getColName = (i) => schema2.rowType.algebraicType.value.elements[i].name;
	const resolvedIndexes = tableDef.indexes.map((idx) => {
		const accessorName = idx.accessorName;
		if (typeof accessorName !== "string" || accessorName.length === 0) throw new TypeError(`Index '${idx.sourceName ?? "<unknown>"}' on table '${tableDef.sourceName}' is missing accessor name`);
		const columnIds = idx.algorithm.tag === "Direct" ? [idx.algorithm.value] : idx.algorithm.value;
		return {
			name: accessorName,
			unique: tableDef.constraints.some((c) => c.data.tag === "Unique" && c.data.value.columns.every((col) => columnIds.includes(col))),
			algorithm: {
				BTree: "btree",
				Hash: "hash",
				Direct: "direct"
			}[idx.algorithm.tag],
			columns: columnIds.map(getColName)
		};
	});
	return {
		sourceName: schema2.tableName || accName,
		accessorName: accName,
		columns: schema2.rowType.row,
		rowType: schema2.rowSpacetimeType,
		indexes: schema2.idxs,
		constraints: tableDef.constraints.map((c) => ({
			name: c.sourceName,
			constraint: "unique",
			columns: c.data.value.columns.map(getColName)
		})),
		resolvedIndexes,
		tableDef,
		...tableDef.isEvent ? { isEvent: true } : {}
	};
}
var ModuleContext = class {
	#compoundTypes = /* @__PURE__ */ new Map();
	/**
	* The global module definition that gets populated by calls to `reducer()` and lifecycle hooks.
	*/
	#moduleDef = {
		typespace: { types: [] },
		tables: [],
		reducers: [],
		types: [],
		rowLevelSecurity: [],
		schedules: [],
		procedures: [],
		views: [],
		viewPrimaryKeys: [],
		lifeCycleReducers: [],
		httpHandlers: [],
		httpRoutes: [],
		caseConversionPolicy: { tag: "SnakeCase" },
		explicitNames: { entries: [] },
		submodules: [],
		environment: []
	};
	get moduleDef() {
		return this.#moduleDef;
	}
	rawModuleDefV10() {
		const sections = [];
		const push = (s) => {
			if (s) sections.push(s);
		};
		const module = this.#moduleDef;
		push(module.typespace && {
			tag: "Typespace",
			value: module.typespace
		});
		push(module.types && {
			tag: "Types",
			value: module.types
		});
		push(module.tables && {
			tag: "Tables",
			value: module.tables
		});
		push(module.reducers && {
			tag: "Reducers",
			value: module.reducers
		});
		push(module.procedures && {
			tag: "Procedures",
			value: module.procedures
		});
		push(module.views && {
			tag: "Views",
			value: module.views
		});
		push(module.viewPrimaryKeys && {
			tag: "ViewPrimaryKeys",
			value: module.viewPrimaryKeys
		});
		push(module.schedules && {
			tag: "Schedules",
			value: module.schedules
		});
		push(module.lifeCycleReducers && {
			tag: "LifeCycleReducers",
			value: module.lifeCycleReducers
		});
		push(module.httpHandlers && {
			tag: "HttpHandlers",
			value: module.httpHandlers
		});
		push(module.httpRoutes && {
			tag: "HttpRoutes",
			value: module.httpRoutes
		});
		push(module.rowLevelSecurity && {
			tag: "RowLevelSecurity",
			value: module.rowLevelSecurity
		});
		push(module.explicitNames && {
			tag: "ExplicitNames",
			value: module.explicitNames
		});
		push(module.caseConversionPolicy && {
			tag: "CaseConversionPolicy",
			value: module.caseConversionPolicy
		});
		push(module.submodules && {
			tag: "Submodules",
			value: module.submodules
		});
		push({
			tag: "Environment",
			value: module.environment
		});
		return { sections };
	}
	addSubmodule(submodule) {
		this.#moduleDef.submodules.push(submodule);
	}
	/**
	* Set the case conversion policy for this module.
	* Called by the settings mechanism.
	*/
	setCaseConversionPolicy(policy) {
		this.#moduleDef.caseConversionPolicy = policy;
	}
	get typespace() {
		return this.#moduleDef.typespace;
	}
	/**
	* Resolves the actual type of a TypeBuilder by following its references until it reaches a non-ref type.
	* @param typespace The typespace to resolve types against.
	* @param typeBuilder The TypeBuilder to resolve.
	* @returns The resolved algebraic type.
	*/
	resolveType(typeBuilder) {
		let ty = typeBuilder.algebraicType;
		while (ty.tag === "Ref") ty = this.typespace.types[ty.value];
		return ty;
	}
	/**
	* Adds a type to the module definition's typespace as a `Ref` if it is a named compound type (Product or Sum).
	* Otherwise, returns the type as is.
	* @param name
	* @param ty
	* @returns
	*/
	registerTypesRecursively(typeBuilder) {
		if (typeBuilder instanceof ProductBuilder && !isUnit(typeBuilder) || typeBuilder instanceof SumBuilder || typeBuilder instanceof RowBuilder) return this.#registerCompoundTypeRecursively(typeBuilder);
		else if (typeBuilder instanceof OptionBuilder) return new OptionBuilder(this.registerTypesRecursively(typeBuilder.value));
		else if (typeBuilder instanceof ResultBuilder) return new ResultBuilder(this.registerTypesRecursively(typeBuilder.ok), this.registerTypesRecursively(typeBuilder.err));
		else if (typeBuilder instanceof ArrayBuilder) return new ArrayBuilder(this.registerTypesRecursively(typeBuilder.element));
		else return typeBuilder;
	}
	#registerCompoundTypeRecursively(typeBuilder) {
		const ty = typeBuilder.algebraicType;
		const name = typeBuilder.typeName;
		if (name === void 0) throw new Error(`Missing type name for ${typeBuilder.constructor.name ?? "TypeBuilder"} ${JSON.stringify(typeBuilder)}`);
		let r = this.#compoundTypes.get(ty);
		if (r != null) return r;
		const newTy = typeBuilder instanceof RowBuilder || typeBuilder instanceof ProductBuilder ? {
			tag: "Product",
			value: { elements: [] }
		} : {
			tag: "Sum",
			value: { variants: [] }
		};
		r = new RefBuilder(this.#moduleDef.typespace.types.length);
		this.#moduleDef.typespace.types.push(newTy);
		this.#compoundTypes.set(ty, r);
		if (typeBuilder instanceof RowBuilder) for (const [name2, elem] of Object.entries(typeBuilder.row)) newTy.value.elements.push({
			name: name2,
			algebraicType: this.registerTypesRecursively(elem.typeBuilder).algebraicType
		});
		else if (typeBuilder instanceof ProductBuilder) for (const [name2, elem] of Object.entries(typeBuilder.elements)) newTy.value.elements.push({
			name: name2,
			algebraicType: this.registerTypesRecursively(elem).algebraicType
		});
		else if (typeBuilder instanceof SumBuilder) for (const [name2, variant] of Object.entries(typeBuilder.variants)) newTy.value.variants.push({
			name: name2,
			algebraicType: this.registerTypesRecursively(variant).algebraicType
		});
		this.#moduleDef.types.push({
			sourceName: splitName(name),
			ty: r.ref,
			customOrdering: true
		});
		return r;
	}
};
function isUnit(typeBuilder) {
	return typeBuilder.typeName == null && typeBuilder.algebraicType.value.elements.length === 0;
}
function splitName(name) {
	const scope = name.split(".");
	return {
		sourceName: scope.pop(),
		scope
	};
}
var textEncoder2 = new TextEncoder();
var textDecoder2 = new TextDecoder("utf-8");
function deserializeMethod(method) {
	switch (method.tag) {
		case "Get": return "GET";
		case "Head": return "HEAD";
		case "Post": return "POST";
		case "Put": return "PUT";
		case "Delete": return "DELETE";
		case "Connect": return "CONNECT";
		case "Options": return "OPTIONS";
		case "Trace": return "TRACE";
		case "Patch": return "PATCH";
		case "Extension": return method.value;
	}
}
var methods = /* @__PURE__ */ new Map([
	["GET", { tag: "Get" }],
	["HEAD", { tag: "Head" }],
	["POST", { tag: "Post" }],
	["PUT", { tag: "Put" }],
	["DELETE", { tag: "Delete" }],
	["CONNECT", { tag: "Connect" }],
	["OPTIONS", { tag: "Options" }],
	["TRACE", { tag: "Trace" }],
	["PATCH", { tag: "Patch" }]
]);
function serializeMethod(method) {
	return methods.get(method?.toUpperCase() ?? "GET") ?? {
		tag: "Extension",
		value: method
	};
}
function serializeHeaders(headers) {
	return { entries: Array.from(headers.entries(), ([name, value]) => ({
		name,
		value: textEncoder2.encode(value)
	})) };
}
function deserializeHeaders(headers) {
	return new Headers(headers.entries.map(({ name, value }) => [name, textDecoder2.decode(value)]));
}
var makeResponse = Symbol("makeResponse");
var SyncResponse = class _SyncResponse {
	#body;
	#inner;
	constructor(body, init) {
		if (body == null) this.#body = null;
		else if (typeof body === "string") this.#body = body;
		else this.#body = new Uint8Array(body).buffer;
		this.#inner = {
			headers: new Headers(init?.headers),
			status: init?.status ?? 200,
			statusText: init?.statusText ?? "",
			type: "default",
			url: null,
			aborted: false,
			version: init?.version ?? { tag: "Http11" }
		};
	}
	static [makeResponse](body, inner) {
		const me = new _SyncResponse(body);
		me.#inner = inner;
		return me;
	}
	get headers() {
		return this.#inner.headers;
	}
	get status() {
		return this.#inner.status;
	}
	get statusText() {
		return this.#inner.statusText;
	}
	get ok() {
		return 200 <= this.#inner.status && this.#inner.status <= 299;
	}
	get url() {
		return this.#inner.url ?? "";
	}
	get type() {
		return this.#inner.type;
	}
	get version() {
		return this.#inner.version;
	}
	arrayBuffer() {
		return this.bytes().buffer;
	}
	bytes() {
		if (this.#body == null) return new Uint8Array();
		else if (typeof this.#body === "string") return textEncoder2.encode(this.#body);
		else return new Uint8Array(this.#body);
	}
	json() {
		return JSON.parse(this.text());
	}
	text() {
		if (this.#body == null) return "";
		else if (typeof this.#body === "string") return this.#body;
		else return textDecoder2.decode(this.#body);
	}
};
var httpHandlerFn = Symbol("SpacetimeDB.httpHandlerFn");
var makeRequest = Symbol("makeRequest");
function coerceRequestBody(body) {
	if (body == null) return null;
	if (typeof body === "string") return body;
	return new Uint8Array(body);
}
function requestBodyToBytes(body) {
	if (body == null) return new Uint8Array();
	if (typeof body === "string") return textEncoder2.encode(body);
	return body;
}
function requestBodyToText(body) {
	if (body == null) return "";
	if (typeof body === "string") return body;
	return textDecoder2.decode(body);
}
var Request = class _Request {
	#body;
	#inner;
	constructor(url, init = {}) {
		this.#body = coerceRequestBody(init.body);
		this.#inner = {
			headers: new Headers(init.headers),
			method: init.method ?? "GET",
			uri: "" + url,
			version: init.version ?? { tag: "Http11" }
		};
	}
	static [makeRequest](body, inner) {
		const me = new _Request(inner.uri);
		me.#body = coerceRequestBody(body);
		me.#inner = inner;
		return me;
	}
	get headers() {
		return this.#inner.headers;
	}
	get method() {
		return this.#inner.method;
	}
	get uri() {
		return this.#inner.uri;
	}
	get url() {
		return this.#inner.uri;
	}
	get version() {
		return this.#inner.version;
	}
	arrayBuffer() {
		return this.bytes().buffer;
	}
	bytes() {
		return requestBodyToBytes(this.#body);
	}
	json() {
		return JSON.parse(this.text());
	}
	text() {
		return requestBodyToText(this.#body);
	}
};
var exportedHttpHandlerObjects = /* @__PURE__ */ new WeakSet();
function makeHttpHandlerExport(ctx, opts, fn) {
	const handlerExport = Object.assign((...args) => fn(...args), {
		[httpHandlerFn]: fn,
		[exportContext]: ctx,
		[registerExport](ctx2, exportName) {
			if (exportedHttpHandlerObjects.has(handlerExport)) throw new TypeError(`HTTP handler '${exportName}' was exported more than once`);
			exportedHttpHandlerObjects.add(handlerExport);
			registerHttpHandler(ctx2, exportName, fn, opts);
			ctx2.httpHandlerExports.set(handlerExport, exportName);
		}
	});
	return handlerExport;
}
function makeHttpRouterExport(ctx, router) {
	return {
		[exportContext]: ctx,
		[registerExport](ctx2) {
			ctx2.pendingHttpRoutes.push(...router.intoRoutes());
		}
	};
}
function registerHttpHandler(ctx, exportName, fn, opts) {
	ctx.defineHttpHandler(exportName);
	ctx.moduleDef.httpHandlers.push({ sourceName: exportName });
	if (opts?.name != null) ctx.moduleDef.explicitNames.entries.push({
		tag: "Function",
		value: {
			sourceName: exportName,
			canonicalName: opts.name
		}
	});
	if (!fn.name) Object.defineProperty(fn, "name", {
		value: exportName,
		writable: false
	});
	ctx.httpHandlers.push(fn);
}
var import_statuses = __toESM(require_statuses());
var Range = class {
	#from;
	#to;
	constructor(from, to) {
		this.#from = from ?? { tag: "unbounded" };
		this.#to = to ?? { tag: "unbounded" };
	}
	get from() {
		return this.#from;
	}
	get to() {
		return this.#to;
	}
};
function table(opts, row, ..._) {
	const { name, public: isPublic = false, indexes: userIndexes = [], scheduled, event: isEvent = false } = opts;
	const colIds = /* @__PURE__ */ new Map();
	const colNameList = [];
	if (!(row instanceof RowBuilder)) row = new RowBuilder(row);
	row.algebraicType.value.elements.forEach((elem, i) => {
		colIds.set(elem.name, i);
		colNameList.push(elem.name);
	});
	const pk = [];
	const indexes = [];
	const constraints = [];
	const sequences = [];
	let scheduleAtCol;
	const defaultValues = [];
	for (const [name2, builder] of Object.entries(row.row)) {
		const meta = builder.columnMetadata;
		if (meta.isPrimaryKey) pk.push(colIds.get(name2));
		const isUnique = meta.isUnique || meta.isPrimaryKey;
		if (meta.indexType || isUnique) {
			const algo = meta.indexType ?? "btree";
			const id = colIds.get(name2);
			let algorithm;
			switch (algo) {
				case "btree":
					algorithm = RawIndexAlgorithm.BTree([id]);
					break;
				case "hash":
					algorithm = RawIndexAlgorithm.Hash([id]);
					break;
				case "direct":
					algorithm = RawIndexAlgorithm.Direct(id);
					break;
			}
			indexes.push({
				sourceName: void 0,
				accessorName: name2,
				algorithm
			});
		}
		if (isUnique) constraints.push({
			sourceName: void 0,
			data: {
				tag: "Unique",
				value: { columns: [colIds.get(name2)] }
			}
		});
		if (meta.isAutoIncrement) sequences.push({
			sourceName: void 0,
			start: void 0,
			minValue: void 0,
			maxValue: void 0,
			column: colIds.get(name2),
			increment: 1n
		});
		if (Object.prototype.hasOwnProperty.call(meta, "defaultValue")) {
			const writer = new BinaryWriter(16);
			builder.serialize(writer, meta.defaultValue);
			defaultValues.push({
				colId: colIds.get(name2),
				value: writer.getBuffer()
			});
		}
		const algebraicType = builder.typeBuilder.algebraicType;
		if (schedule_at_default.isScheduleAt(algebraicType)) scheduleAtCol = colIds.get(name2);
	}
	for (const indexOpts of userIndexes ?? []) {
		const accessor = indexOpts.accessor;
		if (typeof accessor !== "string" || accessor.length === 0) {
			const tableLabel = name ?? "<unnamed>";
			const indexLabel = indexOpts.name ?? "<unnamed>";
			throw new TypeError(`Index '${indexLabel}' on table '${tableLabel}' must define a non-empty 'accessor'`);
		}
		let algorithm;
		switch (indexOpts.algorithm) {
			case "btree":
				algorithm = {
					tag: "BTree",
					value: indexOpts.columns.map((c) => colIds.get(c))
				};
				break;
			case "hash":
				algorithm = {
					tag: "Hash",
					value: indexOpts.columns.map((c) => colIds.get(c))
				};
				break;
			case "direct":
				algorithm = {
					tag: "Direct",
					value: colIds.get(indexOpts.column)
				};
				break;
		}
		indexes.push({
			sourceName: void 0,
			accessorName: accessor,
			algorithm,
			canonicalName: indexOpts.name
		});
	}
	for (const constraintOpts of opts.constraints ?? []) if (constraintOpts.constraint === "unique") {
		const data = {
			tag: "Unique",
			value: { columns: constraintOpts.columns.map((c) => colIds.get(c)) }
		};
		constraints.push({
			sourceName: constraintOpts.name,
			data
		});
		continue;
	}
	const productType = row.algebraicType.value;
	return {
		rowType: row,
		tableName: name,
		rowSpacetimeType: productType,
		tableDef: (ctx, accName) => {
			const tableName = name ?? accName;
			if (row.typeName === void 0) row.typeName = toPascalCase(tableName);
			for (const index of indexes) {
				const sourceName = index.sourceName = `${accName}_${(index.algorithm.tag === "Direct" ? [index.algorithm.value] : index.algorithm.value).map((i) => colNameList[i]).join("_")}_idx_${index.algorithm.tag.toLowerCase()}`;
				const { canonicalName } = index;
				if (canonicalName !== void 0) ctx.moduleDef.explicitNames.entries.push(ExplicitNameEntry.Index({
					sourceName,
					canonicalName
				}));
			}
			return {
				sourceName: accName,
				productTypeRef: ctx.registerTypesRecursively(row).ref,
				primaryKey: pk,
				indexes,
				constraints,
				sequences,
				tableType: { tag: "User" },
				tableAccess: { tag: isPublic ? "Public" : "Private" },
				defaultValues,
				isEvent
			};
		},
		idxs: userIndexes,
		constraints,
		scheduleAtCol,
		schedule: scheduled && scheduleAtCol !== void 0 ? {
			scheduleAtCol,
			reducer: scheduled
		} : void 0
	};
}
var QueryBrand = Symbol("QueryBrand");
var isRowTypedQuery = (val) => !!val && typeof val === "object" && QueryBrand in val;
function toSql(q) {
	return q.toSql();
}
var SemijoinImpl = class _SemijoinImpl {
	constructor(sourceQuery, filterQuery, joinCondition) {
		this.sourceQuery = sourceQuery;
		this.filterQuery = filterQuery;
		this.joinCondition = joinCondition;
		if (sourceQuery.table.sourceName === filterQuery.table.sourceName) throw new Error("Cannot semijoin a table to itself");
	}
	[QueryBrand] = true;
	type = "semijoin";
	build() {
		return this;
	}
	where(predicate) {
		return new _SemijoinImpl(this.sourceQuery.where(predicate), this.filterQuery, this.joinCondition);
	}
	toSql() {
		const left = this.filterQuery;
		const right = this.sourceQuery;
		const leftTable = quoteIdentifier(left.table.sourceName);
		const rightTable = quoteIdentifier(right.table.sourceName);
		let sql = `SELECT ${rightTable}.* FROM ${leftTable} JOIN ${rightTable} ON ${booleanExprToSql(this.joinCondition)}`;
		const clauses = [];
		if (left.whereClause) clauses.push(booleanExprToSql(left.whereClause));
		if (right.whereClause) clauses.push(booleanExprToSql(right.whereClause));
		if (clauses.length > 0) {
			const whereSql = clauses.length === 1 ? clauses[0] : clauses.map(wrapInParens).join(" AND ");
			sql += ` WHERE ${whereSql}`;
		}
		return sql;
	}
};
var FromBuilder = class _FromBuilder {
	constructor(table2, whereClause) {
		this.table = table2;
		this.whereClause = whereClause;
	}
	[QueryBrand] = true;
	where(predicate) {
		const newCondition = normalizePredicateExpr(predicate(this.table.cols));
		const nextWhere = this.whereClause ? this.whereClause.and(newCondition) : newCondition;
		return new _FromBuilder(this.table, nextWhere);
	}
	rightSemijoin(right, on) {
		const sourceQuery = new _FromBuilder(right);
		const joinCondition = on(this.table.indexedCols, right.indexedCols);
		return new SemijoinImpl(sourceQuery, this, joinCondition);
	}
	leftSemijoin(right, on) {
		const filterQuery = new _FromBuilder(right);
		const joinCondition = on(this.table.indexedCols, right.indexedCols);
		return new SemijoinImpl(this, filterQuery, joinCondition);
	}
	toSql() {
		return renderSelectSqlWithJoins(this.table, this.whereClause);
	}
	build() {
		return this;
	}
};
var TableRefImpl = class {
	[QueryBrand] = true;
	type = "table";
	sourceName;
	accessorName;
	cols;
	indexedCols;
	tableDef;
	get columns() {
		return this.tableDef.columns;
	}
	get indexes() {
		return this.tableDef.indexes;
	}
	get rowType() {
		return this.tableDef.rowType;
	}
	get constraints() {
		return this.tableDef.constraints;
	}
	constructor(tableDef) {
		this.sourceName = tableDef.sourceName;
		this.accessorName = tableDef.accessorName;
		this.cols = createRowExpr(tableDef);
		this.indexedCols = this.cols;
		this.tableDef = tableDef;
		Object.freeze(this);
	}
	asFrom() {
		return new FromBuilder(this);
	}
	rightSemijoin(other, on) {
		return this.asFrom().rightSemijoin(other, on);
	}
	leftSemijoin(other, on) {
		return this.asFrom().leftSemijoin(other, on);
	}
	build() {
		return this.asFrom().build();
	}
	toSql() {
		return this.asFrom().toSql();
	}
	where(predicate) {
		return this.asFrom().where(predicate);
	}
};
function createTableRefFromDef(tableDef) {
	return new TableRefImpl(tableDef);
}
function makeQueryBuilder(schema2) {
	const qb = /* @__PURE__ */ Object.create(null);
	for (const table2 of Object.values(schema2.tables)) {
		const ref = createTableRefFromDef(table2);
		qb[table2.accessorName] = ref;
	}
	return Object.freeze(qb);
}
function createRowExpr(tableDef) {
	const row = {};
	for (const columnName of Object.keys(tableDef.columns)) {
		const columnBuilder = tableDef.columns[columnName];
		const column = new ColumnExpression(tableDef.sourceName, columnName, columnBuilder.typeBuilder.algebraicType, columnBuilder.columnMetadata.name);
		row[columnName] = Object.freeze(column);
	}
	return Object.freeze(row);
}
function renderSelectSqlWithJoins(table2, where, extraClauses = []) {
	const sql = `SELECT * FROM ${quoteIdentifier(table2.sourceName)}`;
	const clauses = [];
	if (where) clauses.push(booleanExprToSql(where));
	clauses.push(...extraClauses);
	if (clauses.length === 0) return sql;
	return `${sql} WHERE ${clauses.length === 1 ? clauses[0] : clauses.map(wrapInParens).join(" AND ")}`;
}
var ColumnExpression = class {
	type = "column";
	column;
	columnName;
	table;
	tsValueType;
	spacetimeType;
	constructor(table2, column, spacetimeType, columnName) {
		this.table = table2;
		this.column = column;
		this.columnName = columnName || column;
		this.spacetimeType = spacetimeType;
	}
	eq(x) {
		return new BooleanExpr({
			type: "eq",
			left: this,
			right: normalizeValue(x)
		});
	}
	ne(x) {
		return new BooleanExpr({
			type: "ne",
			left: this,
			right: normalizeValue(x)
		});
	}
	lt(x) {
		return new BooleanExpr({
			type: "lt",
			left: this,
			right: normalizeValue(x)
		});
	}
	lte(x) {
		return new BooleanExpr({
			type: "lte",
			left: this,
			right: normalizeValue(x)
		});
	}
	gt(x) {
		return new BooleanExpr({
			type: "gt",
			left: this,
			right: normalizeValue(x)
		});
	}
	gte(x) {
		return new BooleanExpr({
			type: "gte",
			left: this,
			right: normalizeValue(x)
		});
	}
};
function literal(value) {
	return {
		type: "literal",
		value
	};
}
function normalizeValue(val) {
	if (val.type === "literal") return val;
	if (typeof val === "object" && val != null && "type" in val && val.type === "column") return val;
	return literal(val);
}
function normalizePredicateExpr(value) {
	if (value instanceof BooleanExpr) return value;
	if (typeof value === "boolean") return new BooleanExpr({
		type: "eq",
		left: literal(value),
		right: literal(true)
	});
	return new BooleanExpr({
		type: "eq",
		left: value,
		right: literal(true)
	});
}
var BooleanExpr = class _BooleanExpr {
	constructor(data) {
		this.data = data;
	}
	and(other) {
		return new _BooleanExpr({
			type: "and",
			clauses: [this.data, other.data]
		});
	}
	or(other) {
		return new _BooleanExpr({
			type: "or",
			clauses: [this.data, other.data]
		});
	}
	not() {
		return new _BooleanExpr({
			type: "not",
			clause: this.data
		});
	}
};
function booleanExprToSql(expr, tableAlias) {
	const data = expr instanceof BooleanExpr ? expr.data : expr;
	switch (data.type) {
		case "eq": return `${valueExprToSql(data.left)} = ${valueExprToSql(data.right)}`;
		case "ne": return `${valueExprToSql(data.left)} <> ${valueExprToSql(data.right)}`;
		case "gt": return `${valueExprToSql(data.left)} > ${valueExprToSql(data.right)}`;
		case "gte": return `${valueExprToSql(data.left)} >= ${valueExprToSql(data.right)}`;
		case "lt": return `${valueExprToSql(data.left)} < ${valueExprToSql(data.right)}`;
		case "lte": return `${valueExprToSql(data.left)} <= ${valueExprToSql(data.right)}`;
		case "and": return data.clauses.map((c) => booleanExprToSql(c)).map(wrapInParens).join(" AND ");
		case "or": return data.clauses.map((c) => booleanExprToSql(c)).map(wrapInParens).join(" OR ");
		case "not": return `NOT ${wrapInParens(booleanExprToSql(data.clause))}`;
	}
}
function wrapInParens(sql) {
	return `(${sql})`;
}
function valueExprToSql(expr, tableAlias) {
	if (isLiteralExpr(expr)) return literalValueToSql(expr.value);
	const table2 = expr.table;
	return `${quoteIdentifier(table2)}.${quoteIdentifier(expr.columnName)}`;
}
function literalValueToSql(value) {
	if (value === null || value === void 0) return "NULL";
	if (value instanceof Identity || value instanceof ConnectionId || value instanceof Uuid) return `0x${value.toHexString()}`;
	if (value instanceof Timestamp) return `'${value.toISOString()}'`;
	switch (typeof value) {
		case "number":
		case "bigint": return String(value);
		case "boolean": return value ? "TRUE" : "FALSE";
		case "string": return `'${value.replace(/'/g, "''")}'`;
		default: return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
	}
}
function quoteIdentifier(name) {
	return name.split(".").map((part) => `"${part.replace(/"/g, "\"\"")}"`).join(".");
}
function isLiteralExpr(expr) {
	return expr.type === "literal";
}
function makeViewExport(ctx, opts, params, ret, fn) {
	const viewExport = fn.bind();
	viewExport[exportContext] = ctx;
	viewExport[registerExport] = (ctx2, exportName) => {
		registerView(ctx2, opts, exportName, params, ret, fn);
	};
	return viewExport;
}
function makeAnonViewExport(ctx, opts, params, ret, fn) {
	const viewExport = fn.bind();
	viewExport[exportContext] = ctx;
	viewExport[registerExport] = (ctx2, exportName) => {
		registerAnonymousView(ctx2, opts, exportName, params, ret, fn);
	};
	return viewExport;
}
function registerView(ctx, opts, exportName, params, ret, fn) {
	const described = describeView(ctx, opts, exportName, false, params, ret);
	ctx.views.push(buildViewInfo(ctx, described, fn));
}
function registerAnonymousView(ctx, opts, exportName, params, ret, fn) {
	const described = describeView(ctx, opts, exportName, true, params, ret);
	ctx.anonViews.push(buildViewInfo(ctx, described, fn));
}
function describeView(ctx, opts, exportName, anon, params, ret) {
	ctx.defineFunction(exportName);
	const paramsBuilder = new RowBuilder(params, toPascalCase(exportName));
	let returnType = ctx.registerTypesRecursively(ret).algebraicType;
	const { value: paramType } = ctx.resolveType(ctx.registerTypesRecursively(paramsBuilder));
	ctx.moduleDef.views.push({
		sourceName: exportName,
		index: (anon ? ctx.anonViews : ctx.views).length,
		isPublic: opts.public,
		isAnonymous: anon,
		params: paramType,
		returnType
	});
	const primaryKeyColumns = viewPrimaryKeyColumns(ret);
	if (primaryKeyColumns.length > 1) throw new TypeError(`View '${exportName}' can have at most one primaryKey() column on its returned row type; found ${primaryKeyColumns.join(", ")}`);
	if (primaryKeyColumns.length === 1 && paramType.elements.length === 0) ctx.moduleDef.viewPrimaryKeys.push({
		viewSourceName: exportName,
		columns: primaryKeyColumns
	});
	if (opts.name != null) ctx.moduleDef.explicitNames.entries.push({
		tag: "Function",
		value: {
			sourceName: exportName,
			canonicalName: opts.name
		}
	});
	const wrapOption = returnType.tag == "Sum";
	if (returnType.tag == "Sum") returnType = AlgebraicType.Array(returnType.value.variants[0].algebraicType);
	return {
		paramType,
		returnType,
		wrapOption
	};
}
function buildViewInfo(ctx, { paramType, returnType, wrapOption }, fn) {
	const { typespace } = ctx;
	return {
		fn: wrapOption ? ((viewCtx, args) => {
			const ret = fn(viewCtx, args);
			return ret == null ? [] : [ret];
		}) : fn,
		deserializeParams: ProductType.makeDeserializer(paramType, typespace),
		serializeReturn: AlgebraicType.makeSerializer(returnType, typespace),
		returnTypeBaseSize: bsatnBaseSize(typespace, returnType)
	};
}
function viewPrimaryKeyColumns(ret) {
	const row = viewReturnRow(ret);
	if (row == null) return [];
	return Object.entries(row.row).filter((entry) => entry[1].columnMetadata.isPrimaryKey === true).map(([name]) => name);
}
function viewReturnRow(ret) {
	if (ret instanceof ArrayBuilder && ret.element instanceof RowBuilder) return ret.element;
	if (ret instanceof OptionBuilder && ret.value instanceof RowBuilder) return ret.value;
}
var SenderError = class extends Error {
	constructor(message) {
		super(message);
	}
	get name() {
		return "SenderError";
	}
};
var SpacetimeHostError = class extends Error {
	constructor(message) {
		super(message);
	}
	get name() {
		return "SpacetimeHostError";
	}
};
var errorData = {
	HostCallFailure: 1,
	NotInTransaction: 2,
	BsatnDecodeError: 3,
	NoSuchTable: 4,
	NoSuchIndex: 5,
	NoSuchIter: 6,
	NoSuchConsoleTimer: 7,
	NoSuchBytes: 8,
	NoSpace: 9,
	BufferTooSmall: 11,
	UniqueAlreadyExists: 12,
	ScheduleAtDelayTooLong: 13,
	IndexNotUnique: 14,
	NoSuchRow: 15,
	AutoIncOverflow: 16,
	WouldBlockTransaction: 17,
	TransactionNotAnonymous: 18,
	TransactionIsReadOnly: 19,
	TransactionIsMut: 20,
	HttpError: 21
};
function mapEntries(x, f) {
	return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, f(k, v)]));
}
var errnoToClass = /* @__PURE__ */ new Map();
var errors = Object.freeze(mapEntries(errorData, (name, code) => {
	const cls = Object.defineProperty(class extends SpacetimeHostError {
		get name() {
			return name;
		}
	}, "name", {
		value: name,
		writable: false
	});
	errnoToClass.set(code, cls);
	return cls;
}));
function getErrorConstructor(code) {
	return errnoToClass.get(code) ?? SpacetimeHostError;
}
var SBigInt = typeof BigInt !== "undefined" ? BigInt : void 0;
var One = typeof BigInt !== "undefined" ? BigInt(1) : void 0;
var ThirtyTwo = typeof BigInt !== "undefined" ? BigInt(32) : void 0;
var NumValues = typeof BigInt !== "undefined" ? BigInt(4294967296) : void 0;
function unsafeUniformBigIntDistribution(from, to, rng) {
	var diff = to - from + One;
	var FinalNumValues = NumValues;
	var NumIterations = 1;
	while (FinalNumValues < diff) {
		FinalNumValues <<= ThirtyTwo;
		++NumIterations;
	}
	var value = generateNext(NumIterations, rng);
	if (value < diff) return value + from;
	if (value + diff < FinalNumValues) return value % diff + from;
	var MaxAcceptedRandom = FinalNumValues - FinalNumValues % diff;
	while (value >= MaxAcceptedRandom) value = generateNext(NumIterations, rng);
	return value % diff + from;
}
function generateNext(NumIterations, rng) {
	var value = SBigInt(rng.unsafeNext() + 2147483648);
	for (var num = 1; num < NumIterations; ++num) {
		var out = rng.unsafeNext();
		value = (value << ThirtyTwo) + SBigInt(out + 2147483648);
	}
	return value;
}
function unsafeUniformIntDistributionInternal(rangeSize, rng) {
	var MaxAllowed = rangeSize > 2 ? ~~(4294967296 / rangeSize) * rangeSize : 4294967296;
	var deltaV = rng.unsafeNext() + 2147483648;
	while (deltaV >= MaxAllowed) deltaV = rng.unsafeNext() + 2147483648;
	return deltaV % rangeSize;
}
function fromNumberToArrayInt64(out, n) {
	if (n < 0) {
		var posN = -n;
		out.sign = -1;
		out.data[0] = ~~(posN / 4294967296);
		out.data[1] = posN >>> 0;
	} else {
		out.sign = 1;
		out.data[0] = ~~(n / 4294967296);
		out.data[1] = n >>> 0;
	}
	return out;
}
function substractArrayInt64(out, arrayIntA, arrayIntB) {
	var lowA = arrayIntA.data[1];
	var highA = arrayIntA.data[0];
	var signA = arrayIntA.sign;
	var lowB = arrayIntB.data[1];
	var highB = arrayIntB.data[0];
	var signB = arrayIntB.sign;
	out.sign = 1;
	if (signA === 1 && signB === -1) {
		var low_1 = lowA + lowB;
		var high = highA + highB + (low_1 > 4294967295 ? 1 : 0);
		out.data[0] = high >>> 0;
		out.data[1] = low_1 >>> 0;
		return out;
	}
	var lowFirst = lowA;
	var highFirst = highA;
	var lowSecond = lowB;
	var highSecond = highB;
	if (signA === -1) {
		lowFirst = lowB;
		highFirst = highB;
		lowSecond = lowA;
		highSecond = highA;
	}
	var reminderLow = 0;
	var low = lowFirst - lowSecond;
	if (low < 0) {
		reminderLow = 1;
		low = low >>> 0;
	}
	out.data[0] = highFirst - highSecond - reminderLow;
	out.data[1] = low;
	return out;
}
function unsafeUniformArrayIntDistributionInternal(out, rangeSize, rng) {
	var rangeLength = rangeSize.length;
	while (true) {
		for (var index = 0; index !== rangeLength; ++index) out[index] = unsafeUniformIntDistributionInternal(index === 0 ? rangeSize[0] + 1 : 4294967296, rng);
		for (var index = 0; index !== rangeLength; ++index) {
			var current = out[index];
			var currentInRange = rangeSize[index];
			if (current < currentInRange) return out;
			else if (current > currentInRange) break;
		}
	}
}
var safeNumberMaxSafeInteger = Number.MAX_SAFE_INTEGER;
var sharedA = {
	sign: 1,
	data: [0, 0]
};
var sharedB = {
	sign: 1,
	data: [0, 0]
};
var sharedC = {
	sign: 1,
	data: [0, 0]
};
var sharedData = [0, 0];
function uniformLargeIntInternal(from, to, rangeSize, rng) {
	var rangeSizeArrayIntValue = rangeSize <= safeNumberMaxSafeInteger ? fromNumberToArrayInt64(sharedC, rangeSize) : substractArrayInt64(sharedC, fromNumberToArrayInt64(sharedA, to), fromNumberToArrayInt64(sharedB, from));
	if (rangeSizeArrayIntValue.data[1] === 4294967295) {
		rangeSizeArrayIntValue.data[0] += 1;
		rangeSizeArrayIntValue.data[1] = 0;
	} else rangeSizeArrayIntValue.data[1] += 1;
	unsafeUniformArrayIntDistributionInternal(sharedData, rangeSizeArrayIntValue.data, rng);
	return sharedData[0] * 4294967296 + sharedData[1] + from;
}
function unsafeUniformIntDistribution(from, to, rng) {
	var rangeSize = to - from;
	if (rangeSize <= 4294967295) return unsafeUniformIntDistributionInternal(rangeSize + 1, rng) + from;
	return uniformLargeIntInternal(from, to, rangeSize, rng);
}
var XoroShiro128Plus = (function() {
	function XoroShiro128Plus2(s01, s00, s11, s10) {
		this.s01 = s01;
		this.s00 = s00;
		this.s11 = s11;
		this.s10 = s10;
	}
	XoroShiro128Plus2.prototype.clone = function() {
		return new XoroShiro128Plus2(this.s01, this.s00, this.s11, this.s10);
	};
	XoroShiro128Plus2.prototype.next = function() {
		var nextRng = new XoroShiro128Plus2(this.s01, this.s00, this.s11, this.s10);
		return [nextRng.unsafeNext(), nextRng];
	};
	XoroShiro128Plus2.prototype.unsafeNext = function() {
		var out = this.s00 + this.s10 | 0;
		var a0 = this.s10 ^ this.s00;
		var a1 = this.s11 ^ this.s01;
		var s00 = this.s00;
		var s01 = this.s01;
		this.s00 = s00 << 24 ^ s01 >>> 8 ^ a0 ^ a0 << 16;
		this.s01 = s01 << 24 ^ s00 >>> 8 ^ a1 ^ (a1 << 16 | a0 >>> 16);
		this.s10 = a1 << 5 ^ a0 >>> 27;
		this.s11 = a0 << 5 ^ a1 >>> 27;
		return out;
	};
	XoroShiro128Plus2.prototype.jump = function() {
		var nextRng = new XoroShiro128Plus2(this.s01, this.s00, this.s11, this.s10);
		nextRng.unsafeJump();
		return nextRng;
	};
	XoroShiro128Plus2.prototype.unsafeJump = function() {
		var ns01 = 0;
		var ns00 = 0;
		var ns11 = 0;
		var ns10 = 0;
		var jump = [
			3639956645,
			3750757012,
			1261568508,
			386426335
		];
		for (var i = 0; i !== 4; ++i) for (var mask = 1; mask; mask <<= 1) {
			if (jump[i] & mask) {
				ns01 ^= this.s01;
				ns00 ^= this.s00;
				ns11 ^= this.s11;
				ns10 ^= this.s10;
			}
			this.unsafeNext();
		}
		this.s01 = ns01;
		this.s00 = ns00;
		this.s11 = ns11;
		this.s10 = ns10;
	};
	XoroShiro128Plus2.prototype.getState = function() {
		return [
			this.s01,
			this.s00,
			this.s11,
			this.s10
		];
	};
	return XoroShiro128Plus2;
})();
function fromState(state) {
	if (!(state.length === 4)) throw new Error("The state must have been produced by a xoroshiro128plus RandomGenerator");
	return new XoroShiro128Plus(state[0], state[1], state[2], state[3]);
}
var xoroshiro128plus = Object.assign(function(seed) {
	return new XoroShiro128Plus(-1, ~seed, seed | 0, 0);
}, { fromState });
var { asUintN } = BigInt;
function pcg32(state) {
	state = asUintN(64, state * 6364136223846793005n + 11634580027462260723n);
	const xorshifted = Number(asUintN(32, (state >> 18n ^ state) >> 27n));
	const rot = Number(asUintN(32, state >> 59n));
	return xorshifted >> rot | xorshifted << 32 - rot;
}
function generateFloat64(rng) {
	const g1 = unsafeUniformIntDistribution(0, (1 << 26) - 1, rng);
	const g2 = unsafeUniformIntDistribution(0, (1 << 27) - 1, rng);
	return (g1 * Math.pow(2, 27) + g2) * Math.pow(2, -53);
}
function makeRandomFromSeed(seed) {
	const rng = xoroshiro128plus(pcg32(seedToBigInt(seed)));
	const random = () => generateFloat64(rng);
	random.fill = (array) => {
		if (isBigIntArray(array)) {
			const upper = (1n << BigInt(array.BYTES_PER_ELEMENT * 8)) - 1n;
			for (let i = 0; i < array.length; i++) array[i] = unsafeUniformBigIntDistribution(0n, upper, rng);
		} else {
			const upper = Math.pow(2, array.BYTES_PER_ELEMENT * 8) - 1;
			for (let i = 0; i < array.length; i++) array[i] = unsafeUniformIntDistribution(0, upper, rng);
		}
		return array;
	};
	random.shuffle = (array) => {
		for (let currentIndex = array.length - 1; currentIndex > 0; currentIndex--) {
			const swapIndex = random.integerInRange(0, currentIndex);
			[array[currentIndex], array[swapIndex]] = [array[swapIndex], array[currentIndex]];
		}
		return array;
	};
	random.uint32 = () => rng.unsafeNext();
	random.integerInRange = (min, max) => unsafeUniformIntDistribution(min, max, rng);
	random.bigintInRange = (min, max) => unsafeUniformBigIntDistribution(min, max, rng);
	return random;
}
function makeRandom(seed) {
	return makeRandomFromSeed(seed);
}
function seedToBigInt(seed) {
	if (typeof seed === "bigint") return seed;
	if (typeof seed === "number") return BigInt(seed);
	if (seed instanceof Uint8Array) {
		let value = 0n;
		const len = Math.min(seed.byteLength, 8);
		for (let i = 0; i < len; i++) value |= BigInt(seed[i]) << BigInt(i * 8);
		return value;
	}
	return seed.microsSinceUnixEpoch;
}
function isBigIntArray(array) {
	return array instanceof BigInt64Array || array instanceof BigUint64Array;
}
var sys = {
	..._syscalls2_0,
	..._syscalls2_1
};
var hostBackend = {
	identity: sys.identity,
	getJwtPayload: sys.get_jwt_payload,
	tableIdFromName: sys.table_id_from_name,
	indexIdFromName: sys.index_id_from_name,
	datastoreTableRowCount: sys.datastore_table_row_count,
	datastoreTableScanBsatn: sys.datastore_table_scan_bsatn,
	datastoreInsertBsatn: sys.datastore_insert_bsatn,
	datastoreDeleteAllByEqBsatn: sys.datastore_delete_all_by_eq_bsatn,
	datastoreIndexScanPointBsatn: sys.datastore_index_scan_point_bsatn,
	datastoreIndexScanRangeBsatn: sys.datastore_index_scan_range_bsatn,
	datastoreDeleteByIndexScanPointBsatn: sys.datastore_delete_by_index_scan_point_bsatn,
	datastoreDeleteByIndexScanRangeBsatn: sys.datastore_delete_by_index_scan_range_bsatn,
	datastoreUpdateBsatn: sys.datastore_update_bsatn,
	datastoreClear: sys.datastore_clear,
	rowIterBsatnAdvance: sys.row_iter_bsatn_advance,
	rowIterBsatnClose: sys.row_iter_bsatn_close,
	procedureStartMutTx: sys.procedure_start_mut_tx,
	procedureCommitMutTx: sys.procedure_commit_mut_tx,
	procedureAbortMutTx: sys.procedure_abort_mut_tx,
	procedureHttpRequest: sys.procedure_http_request
};
var { freeze } = Object;
var sys2 = {
	..._syscalls2_0,
	..._syscalls2_1
};
function isDatastoreBackend(value) {
	return value !== null && typeof value === "object" && "tableIdFromName" in value && "procedureStartMutTx" in value;
}
function requestFromWire(request, body) {
	return Request[makeRequest](body, {
		headers: deserializeHeaders(request.headers),
		method: deserializeMethod(request.method),
		uri: request.uri,
		version: request.version
	});
}
function responseIntoWire(response) {
	return [{
		headers: serializeHeaders(response.headers),
		version: response.version,
		code: response.status
	}, response.bytes()];
}
function parseJsonObject(json) {
	let value;
	try {
		value = JSON.parse(json);
	} catch {
		throw new Error("Invalid JSON: failed to parse string");
	}
	if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected a JSON object at the top level");
	return value;
}
var JwtClaimsImpl = class {
	/**
	* Creates a new JwtClaims instance.
	* @param rawPayload The JWT payload as a raw JSON string.
	* @param identity The identity for this JWT. We are only taking this because we don't have a blake3 implementation (which we need to compute it).
	*/
	constructor(rawPayload, identity) {
		this.rawPayload = rawPayload;
		this.fullPayload = parseJsonObject(rawPayload);
		this._identity = identity;
	}
	fullPayload;
	_identity;
	get identity() {
		return this._identity;
	}
	get subject() {
		return this.fullPayload["sub"];
	}
	get issuer() {
		return this.fullPayload["iss"];
	}
	get audience() {
		const aud = this.fullPayload["aud"];
		if (aud == null) return [];
		return typeof aud === "string" ? [aud] : aud;
	}
};
var AuthCtxImpl = class _AuthCtxImpl {
	isInternal;
	_jwtSource;
	_initializedJWT = false;
	_jwtClaims;
	_senderIdentity;
	constructor(opts) {
		this.isInternal = opts.isInternal;
		this._jwtSource = opts.jwtSource;
		this._senderIdentity = opts.senderIdentity;
	}
	_initializeJWT() {
		if (this._initializedJWT) return;
		this._initializedJWT = true;
		const token = this._jwtSource();
		if (!token) this._jwtClaims = null;
		else this._jwtClaims = new JwtClaimsImpl(token, this._senderIdentity);
		Object.freeze(this);
	}
	/** Lazily compute whether a JWT exists and is parseable. */
	get hasJWT() {
		this._initializeJWT();
		return this._jwtClaims !== null;
	}
	/** Lazily parse the JwtClaims only when accessed. */
	get jwt() {
		this._initializeJWT();
		return this._jwtClaims;
	}
	/** Create a context representing internal (non-user) requests. */
	static internal() {
		return new _AuthCtxImpl({
			isInternal: true,
			jwtSource: () => null,
			senderIdentity: Identity.zero()
		});
	}
	/** If there is a connection id, look up the JWT payload from the system tables. */
	static fromBackend(connectionId, sender, backend) {
		if (connectionId === null) return new _AuthCtxImpl({
			isInternal: false,
			jwtSource: () => null,
			senderIdentity: sender
		});
		return new _AuthCtxImpl({
			isInternal: false,
			jwtSource: () => {
				const payloadBuf = backend.getJwtPayload(connectionId.__connection_id__);
				if (payloadBuf.length === 0) return null;
				return new TextDecoder().decode(payloadBuf);
			},
			senderIdentity: sender
		});
	}
	/** If there is a connection id, look up the JWT payload from the host system tables. */
	static fromSystemTables(connectionId, sender) {
		return _AuthCtxImpl.fromBackend(connectionId, sender, hostBackend);
	}
};
var ReducerCtxImpl = class ReducerCtx {
	#identity;
	#senderAuth;
	#uuidCounter;
	#random;
	#backend;
	sender;
	timestamp;
	connectionId;
	db;
	env = environment;
	as;
	constructor(sender, timestamp, connectionId, dbView, backendOrAsViews = hostBackend, senderAuth, random, asViews = {}) {
		Object.seal(this);
		this.sender = sender;
		this.timestamp = timestamp;
		this.connectionId = connectionId;
		this.db = dbView;
		if (isDatastoreBackend(backendOrAsViews)) {
			this.#backend = backendOrAsViews;
			this.#senderAuth = senderAuth;
			this.#random = random;
		} else {
			this.#backend = hostBackend;
			asViews = backendOrAsViews;
		}
		this.as = asViews;
	}
	/** Reset the `ReducerCtx` to be used for a new transaction */
	static resetHost(me, sender, timestamp, connectionId, dbView, asViews) {
		me.sender = sender;
		me.timestamp = timestamp;
		me.connectionId = connectionId;
		me.#backend = hostBackend;
		me.#senderAuth = void 0;
		me.#random = void 0;
		me.#uuidCounter = void 0;
		if (dbView !== void 0) me.db = dbView;
		if (asViews !== void 0) me.as = asViews;
	}
	/** Reset the `ReducerCtx` to be used with an injectable backend. */
	static reset(me, sender, timestamp, connectionId, backendOrDbView = hostBackend, senderAuth, random, dbView, asViews) {
		me.sender = sender;
		me.timestamp = timestamp;
		me.connectionId = connectionId;
		if (isDatastoreBackend(backendOrDbView)) {
			me.#backend = backendOrDbView;
			me.#senderAuth = senderAuth;
			me.#random = random;
		} else {
			me.#backend = hostBackend;
			me.#senderAuth = void 0;
			me.#random = void 0;
			dbView = backendOrDbView;
			asViews = senderAuth;
		}
		me.#uuidCounter = void 0;
		if (dbView !== void 0) me.db = dbView;
		if (asViews !== void 0) me.as = asViews;
	}
	get databaseIdentity() {
		return this.#identity ??= new Identity(this.#backend.identity());
	}
	get identity() {
		return this.databaseIdentity;
	}
	get senderAuth() {
		return this.#senderAuth ??= AuthCtxImpl.fromBackend(this.connectionId, this.sender, this.#backend);
	}
	get random() {
		return this.#random ??= makeRandom(this.timestamp);
	}
	/**
	* Create a new random {@link Uuid} `v4` using this `ReducerCtx`'s RNG.
	*/
	newUuidV4() {
		const bytes = this.random.fill(new Uint8Array(16));
		return Uuid.fromRandomBytesV4(bytes);
	}
	/**
	* Create a new sortable {@link Uuid} `v7` using this `ReducerCtx`'s RNG, counter,
	* and timestamp.
	*/
	newUuidV7() {
		const bytes = this.random.fill(new Uint8Array(4));
		const counter = this.#uuidCounter ??= { value: 0 };
		return Uuid.fromCounterV7(counter, this.timestamp, bytes);
	}
};
var callUserFunction = function __spacetimedb_end_short_backtrace(fn, ...args) {
	return fn(...args);
};
function runWithTx(makeCtx, body, backend = hostBackend) {
	const run = () => {
		const timestamp = backend.procedureStartMutTx();
		try {
			return body(makeCtx(new Timestamp(timestamp)));
		} catch (e) {
			backend.procedureAbortMutTx();
			throw e;
		}
	};
	let res = run();
	try {
		backend.procedureCommitMutTx();
		return res;
	} catch {}
	console.warn("committing anonymous transaction failed");
	res = run();
	try {
		backend.procedureCommitMutTx();
		return res;
	} catch (e) {
		throw new Error("transaction retry failed again", { cause: e });
	}
}
function flattenSubmoduleDispatches(dispatches, parentPrefix = "") {
	const result = [];
	for (const d of dispatches) {
		const namePrefix = parentPrefix + d.namespace + ".";
		result.push({
			reducerFns: d.reducerFns,
			reducerDefs: d.reducerDefs,
			procedureFns: d.procedureFns,
			procedureDefs: d.procedureDefs,
			anonViewFns: d.anonViewFns,
			viewFns: d.viewFns,
			tables: d.tables,
			schemaTables: d.schemaTables,
			typespace: d.typespace,
			dbView_: void 0,
			queryBuilder_: void 0,
			namePrefix,
			subDispatches: d.subDispatches
		});
		result.push(...flattenSubmoduleDispatches(d.subDispatches, namePrefix));
	}
	return result;
}
var makeHooks = (schema2) => new ModuleHooksImpl(schema2);
var ModuleHooksImpl = class {
	#schema;
	#dbView_;
	#consumerAs_;
	#reducerArgsDeserializers;
	#consumerReducerCount;
	#consumerProcedureCount;
	#flatSubmodules;
	#consumerAnonViewCount;
	#consumerViewCount;
	/** Cache the `ReducerCtx` object to avoid allocating anew for every reducer call. */
	#reducerCtx_;
	/** Per-submodule alias ctx maps, cached lazily (parallel to #flatSubmodules). */
	#submoduleAsViews_ = [];
	constructor(schema2) {
		this.#schema = schema2;
		this.#consumerReducerCount = schema2.reducers.length;
		this.#consumerProcedureCount = schema2.procedures.length;
		this.#consumerAnonViewCount = schema2.anonViews.length;
		this.#consumerViewCount = schema2.views.length;
		this.#flatSubmodules = flattenSubmoduleDispatches(schema2.submoduleDispatchInfos);
		const consumerDeserializers = schema2.moduleDef.reducers.map(({ params }) => ProductType.makeDeserializer(params, schema2.typespace));
		const submoduleDeserializers = this.#flatSubmodules.flatMap(({ reducerDefs, typespace }) => reducerDefs.map(({ params }) => ProductType.makeDeserializer(params, typespace)));
		this.#reducerArgsDeserializers = [...consumerDeserializers, ...submoduleDeserializers];
	}
	get #dbView() {
		if (this.#dbView_ !== void 0) return this.#dbView_;
		const rootTables = Object.values(this.#schema.schemaType.tables).map((table2) => [table2.accessorName, makeTableView(this.#schema.typespace, table2.tableDef)]);
		const submoduleNs = this.#schema.submoduleDispatchInfos.map((dispatch) => [dispatch.namespace, buildDbViewForDispatch(dispatch, dispatch.namespace + ".")]);
		this.#dbView_ = freeze(Object.fromEntries([...rootTables, ...submoduleNs]));
		return this.#dbView_;
	}
	#getSubmoduleDbView(submoduleIdx) {
		const m = this.#flatSubmodules[submoduleIdx];
		return m.dbView_ ??= freeze(Object.fromEntries(m.tables.map(({ accessorName, tableDef }) => [accessorName, makeTableView(m.typespace, tableDef, m.namePrefix)])));
	}
	#getSubmoduleAsViews(submoduleIdx) {
		return this.#submoduleAsViews_[submoduleIdx] ??= buildAliasCtxMap(this.#reducerCtx, this.#flatSubmodules[submoduleIdx].subDispatches, this.#flatSubmodules[submoduleIdx].namePrefix);
	}
	/** Query builder scoped to the submodule's own tables, with namespace-prefixed
	*  source names so generated SQL targets the mounted table names. */
	#getSubmoduleQueryBuilder(submoduleIdx) {
		const m = this.#flatSubmodules[submoduleIdx];
		return m.queryBuilder_ ??= makeQueryBuilder({ tables: Object.fromEntries(Object.entries(m.schemaTables).map(([key, def]) => [key, {
			...def,
			sourceName: m.namePrefix + def.sourceName
		}])) });
	}
	get #reducerCtx() {
		return this.#reducerCtx_ ??= new ReducerCtxImpl(Identity.zero(), Timestamp.UNIX_EPOCH, null, this.#dbView);
	}
	get #consumerAs() {
		return this.#consumerAs_ ??= buildAliasCtxMap(this.#reducerCtx, this.#schema.submoduleDispatchInfos, "");
	}
	__describe_module__() {
		const writer = new BinaryWriter(128);
		RawModuleDef.serialize(writer, RawModuleDef.V10(this.#schema.rawModuleDefV10()));
		return writer.getBuffer();
	}
	__get_error_constructor__(code) {
		return getErrorConstructor(code);
	}
	get __sender_error_class__() {
		return SenderError;
	}
	__call_reducer__(reducerId, sender, connId, timestamp, argsBuf) {
		const deserializeArgs = this.#reducerArgsDeserializers[reducerId];
		BINARY_READER.reset(argsBuf);
		const args = deserializeArgs(BINARY_READER);
		const senderIdentity = new Identity(sender);
		let fn;
		let dbView;
		let asViews;
		if (reducerId < this.#consumerReducerCount) {
			fn = this.#schema.reducers[reducerId];
			dbView = this.#dbView;
			asViews = this.#consumerAs;
		} else {
			let offset = this.#consumerReducerCount;
			for (let i = 0; i < this.#flatSubmodules.length; i++) {
				const m = this.#flatSubmodules[i];
				if (reducerId < offset + m.reducerFns.length) {
					fn = m.reducerFns[reducerId - offset];
					dbView = this.#getSubmoduleDbView(i);
					asViews = this.#getSubmoduleAsViews(i);
					break;
				}
				offset += m.reducerFns.length;
			}
			if (fn === void 0) throw new RangeError(`unknown reducerId ${reducerId}`);
		}
		const ctx = this.#reducerCtx;
		ReducerCtxImpl.resetHost(ctx, senderIdentity, new Timestamp(timestamp), ConnectionId.nullIfZero(new ConnectionId(connId)), dbView, asViews);
		callUserFunction(fn, ctx, args);
	}
	__call_view__(id, sender, argsBuf) {
		const moduleCtx = this.#schema;
		let viewFns;
		let localId;
		let dbView;
		let from;
		if (id < this.#consumerViewCount) {
			viewFns = moduleCtx.views;
			localId = id;
			dbView = this.#dbView;
			from = makeQueryBuilder(moduleCtx.schemaType);
		} else {
			let offset = this.#consumerViewCount;
			let found = false;
			for (let i = 0; i < this.#flatSubmodules.length; i++) {
				const m = this.#flatSubmodules[i];
				if (id < offset + m.viewFns.length) {
					viewFns = m.viewFns;
					localId = id - offset;
					dbView = this.#getSubmoduleDbView(i);
					from = this.#getSubmoduleQueryBuilder(i);
					found = true;
					break;
				}
				offset += m.viewFns.length;
			}
			if (!found) throw new RangeError(`unknown viewId ${id}`);
		}
		const { fn, deserializeParams, serializeReturn, returnTypeBaseSize } = viewFns[localId];
		const ret = callUserFunction(fn, freeze({
			env: environment,
			sender: new Identity(sender),
			db: dbView,
			from
		}), deserializeParams(new BinaryReader(argsBuf)));
		const retBuf = new BinaryWriter(returnTypeBaseSize);
		if (isRowTypedQuery(ret)) {
			const query = toSql(ret);
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RawSql(query));
		} else {
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RowData);
			serializeReturn(retBuf, ret);
		}
		return { data: retBuf.getBuffer() };
	}
	__call_view_anon__(id, argsBuf) {
		const moduleCtx = this.#schema;
		let anonViewFns;
		let localId;
		let dbView;
		let from;
		if (id < this.#consumerAnonViewCount) {
			anonViewFns = moduleCtx.anonViews;
			localId = id;
			dbView = this.#dbView;
			from = makeQueryBuilder(moduleCtx.schemaType);
		} else {
			let offset = this.#consumerAnonViewCount;
			let found = false;
			for (let i = 0; i < this.#flatSubmodules.length; i++) {
				const m = this.#flatSubmodules[i];
				if (id < offset + m.anonViewFns.length) {
					anonViewFns = m.anonViewFns;
					localId = id - offset;
					dbView = this.#getSubmoduleDbView(i);
					from = this.#getSubmoduleQueryBuilder(i);
					found = true;
					break;
				}
				offset += m.anonViewFns.length;
			}
			if (!found) throw new RangeError(`unknown anonViewId ${id}`);
		}
		const { fn, deserializeParams, serializeReturn, returnTypeBaseSize } = anonViewFns[localId];
		const ret = callUserFunction(fn, freeze({
			env: environment,
			db: dbView,
			from
		}), deserializeParams(new BinaryReader(argsBuf)));
		const retBuf = new BinaryWriter(returnTypeBaseSize);
		if (isRowTypedQuery(ret)) {
			const query = toSql(ret);
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RawSql(query));
		} else {
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RowData);
			serializeReturn(retBuf, ret);
		}
		return { data: retBuf.getBuffer() };
	}
	__call_procedure__(id, sender, connection_id, timestamp, args) {
		const senderIdentity = new Identity(sender);
		const connId = ConnectionId.nullIfZero(new ConnectionId(connection_id));
		const ts = new Timestamp(timestamp);
		if (id < this.#consumerProcedureCount) return callProcedure(this.#schema.procedures, id, senderIdentity, connId, ts, args, () => this.#dbView, this.#schema.submoduleDispatchInfos);
		let offset = this.#consumerProcedureCount;
		for (let i = 0; i < this.#flatSubmodules.length; i++) {
			const m = this.#flatSubmodules[i];
			if (id < offset + m.procedureFns.length) return callProcedure(m.procedureFns, id - offset, senderIdentity, connId, ts, args, () => this.#getSubmoduleDbView(i), m.subDispatches, m.namePrefix);
			offset += m.procedureFns.length;
		}
		throw new RangeError(`unknown procedureId ${id}`);
	}
	__call_http_handler__(id, timestamp, request, body) {
		const moduleCtx = this.#schema;
		const handler = moduleCtx.httpHandlers[id];
		const [responseMetadata, responseBody] = responseIntoWire(callUserFunction(handler, new HandlerContextImpl(new Timestamp(timestamp), () => this.#dbView, this.#schema.submoduleDispatchInfos), requestFromWire(HttpRequest.deserialize(new BinaryReader(request)), body)));
		const responseBuf = new BinaryWriter(bsatnBaseSize(moduleCtx.typespace, HttpResponse.algebraicType));
		HttpResponse.serialize(responseBuf, responseMetadata);
		return [responseBuf.getBuffer(), responseBody];
	}
};
var BINARY_WRITER = new BinaryWriter(0);
var BINARY_READER = new BinaryReader(new Uint8Array());
var HandlerContextImpl = class {
	constructor(timestamp, dbView, dispatches = []) {
		this.timestamp = timestamp;
		this.#dbView = dbView;
		this.#dispatches = dispatches;
	}
	env = environment;
	#identity;
	#uuidCounter;
	#random;
	#dbView;
	#dispatches;
	#asViews;
	http = httpClient;
	get identity() {
		return this.#identity ??= new Identity(sys2.identity());
	}
	get random() {
		return this.#random ??= makeRandom(this.timestamp);
	}
	get as() {
		return this.#asViews ??= buildHandlerAliasCtxMap(this, this.#dispatches, "");
	}
	withTx(body) {
		const dispatches = this.#dispatches;
		return runWithTx((timestamp) => {
			const tx = new ReducerCtxImpl(Identity.zero(), timestamp, null, this.#dbView());
			if (dispatches.length > 0) tx.as = buildAliasCtxMap(tx, dispatches, "");
			return tx;
		}, body);
	}
	newUuidV4() {
		const bytes = this.random.fill(new Uint8Array(16));
		return Uuid.fromRandomBytesV4(bytes);
	}
	newUuidV7() {
		const bytes = this.random.fill(new Uint8Array(4));
		const counter = this.#uuidCounter ??= { value: 0 };
		return Uuid.fromCounterV7(counter, this.timestamp, bytes);
	}
};
function buildDbViewForDispatch(dispatch, namePrefix) {
	const tableEntries = dispatch.tables.map(({ accessorName, tableDef }) => [accessorName, makeTableView(dispatch.typespace, tableDef, namePrefix)]);
	const subNsEntries = dispatch.subDispatches.map((sub) => [sub.namespace, buildDbViewForDispatch(sub, namePrefix + sub.namespace + ".")]);
	return freeze(Object.fromEntries([...tableEntries, ...subNsEntries]));
}
function buildAliasCtx(parent, dispatch, namePrefix) {
	return {
		get sender() {
			return parent.sender;
		},
		get databaseIdentity() {
			return parent.databaseIdentity;
		},
		get identity() {
			return parent.identity;
		},
		get timestamp() {
			return parent.timestamp;
		},
		get connectionId() {
			return parent.connectionId;
		},
		get senderAuth() {
			return parent.senderAuth;
		},
		get random() {
			return parent.random;
		},
		newUuidV4() {
			return parent.newUuidV4();
		},
		newUuidV7() {
			return parent.newUuidV7();
		},
		db: buildDbViewForDispatch(dispatch, namePrefix),
		as: buildAliasCtxMap(parent, dispatch.subDispatches, namePrefix)
	};
}
function buildAliasCtxMap(parent, dispatches, parentPrefix) {
	return freeze(Object.fromEntries(dispatches.map((d) => [d.namespace, buildAliasCtx(parent, d, parentPrefix + d.namespace + ".")])));
}
function buildHandlerAliasCtx(parent, dispatch, namePrefix) {
	let nsDb_;
	return {
		get timestamp() {
			return parent.timestamp;
		},
		get http() {
			return parent.http;
		},
		get identity() {
			return parent.identity;
		},
		get random() {
			return parent.random;
		},
		as: buildHandlerAliasCtxMap(parent, dispatch.subDispatches, namePrefix),
		withTx(body) {
			return runWithTx((ts) => {
				const tx = new ReducerCtxImpl(Identity.zero(), ts, null, nsDb_ ??= buildDbViewForDispatch(dispatch, namePrefix));
				assignTxAliasViews(tx, dispatch.subDispatches, namePrefix);
				return tx;
			}, body);
		},
		newUuidV4() {
			return parent.newUuidV4();
		},
		newUuidV7() {
			return parent.newUuidV7();
		}
	};
}
function buildHandlerAliasCtxMap(parent, dispatches, parentPrefix) {
	return freeze(Object.fromEntries(dispatches.map((d) => [d.namespace, buildHandlerAliasCtx(parent, d, parentPrefix + d.namespace + ".")])));
}
function buildProcedureAliasCtx(parent, dispatch, namePrefix) {
	let nsDb_;
	return {
		get sender() {
			return parent.sender;
		},
		get databaseIdentity() {
			return parent.databaseIdentity;
		},
		get identity() {
			return parent.identity;
		},
		get timestamp() {
			return parent.timestamp;
		},
		get connectionId() {
			return parent.connectionId;
		},
		get http() {
			return parent.http;
		},
		get random() {
			return parent.random;
		},
		sleep(duration) {
			return parent.sleep(duration);
		},
		as: buildProcedureAliasCtxMap(parent, dispatch.subDispatches, namePrefix),
		withTx(body) {
			return runWithTx((ts) => {
				const tx = new ReducerCtxImpl(parent.sender, ts, parent.connectionId, nsDb_ ??= buildDbViewForDispatch(dispatch, namePrefix));
				assignTxAliasViews(tx, dispatch.subDispatches, namePrefix);
				return tx;
			}, body);
		},
		newUuidV4() {
			return parent.newUuidV4();
		},
		newUuidV7() {
			return parent.newUuidV7();
		}
	};
}
function buildProcedureAliasCtxMap(parent, dispatches, parentPrefix) {
	return freeze(Object.fromEntries(dispatches.map((d) => [d.namespace, buildProcedureAliasCtx(parent, d, parentPrefix + d.namespace + ".")])));
}
function assignTxAliasViews(tx, dispatches, parentPrefix = "") {
	if (dispatches.length > 0) tx.as = buildAliasCtxMap(tx, dispatches, parentPrefix);
}
function makeTableView(typespace, table2, backendOrNamePrefix = hostBackend, namePrefix = "") {
	const backend = isDatastoreBackend(backendOrNamePrefix) ? backendOrNamePrefix : hostBackend;
	if (typeof backendOrNamePrefix === "string") namePrefix = backendOrNamePrefix;
	const table_id = backend.tableIdFromName(namePrefix + table2.sourceName);
	const rowType = typespace.types[table2.productTypeRef];
	if (rowType.tag !== "Product") throw "impossible";
	const serializeRow = AlgebraicType.makeSerializer(rowType, typespace);
	const deserializeRow = AlgebraicType.makeDeserializer(rowType, typespace);
	const sequences = table2.sequences.map((seq) => {
		const col = rowType.value.elements[seq.column];
		const colType = col.algebraicType;
		let sequenceTrigger;
		switch (colType.tag) {
			case "U8":
			case "I8":
			case "U16":
			case "I16":
			case "U32":
			case "I32":
				sequenceTrigger = 0;
				break;
			case "U64":
			case "I64":
			case "U128":
			case "I128":
			case "U256":
			case "I256":
				sequenceTrigger = 0n;
				break;
			default: throw new TypeError("invalid sequence type");
		}
		return {
			colName: col.name,
			sequenceTrigger,
			deserialize: AlgebraicType.makeDeserializer(colType, typespace)
		};
	});
	const hasAutoIncrement = sequences.length > 0;
	const iter = () => tableIterator(backend.datastoreTableScanBsatn(table_id), deserializeRow, backend);
	const integrateGeneratedColumns = hasAutoIncrement ? (row, ret_buf) => {
		BINARY_READER.reset(ret_buf);
		for (const { colName, deserialize, sequenceTrigger } of sequences) if (row[colName] === sequenceTrigger) row[colName] = deserialize(BINARY_READER);
	} : null;
	const generatedColumnsView = (generated, fallback) => generated instanceof Uint8Array ? new DataView(generated.buffer, generated.byteOffset, generated.byteLength) : fallback;
	const tableMethods = {
		count: () => BigInt(backend.datastoreTableRowCount(table_id)),
		iter,
		[Symbol.iterator]: () => iter(),
		insert: (row) => {
			const buf = LEAF_BUF;
			BINARY_WRITER.reset(buf);
			serializeRow(BINARY_WRITER, row);
			const generated = backend.datastoreInsertBsatn(table_id, buf.buffer, BINARY_WRITER.offset);
			const ret = { ...row };
			integrateGeneratedColumns?.(ret, generatedColumnsView(generated, buf.view));
			return ret;
		},
		delete: (row) => {
			const buf = LEAF_BUF;
			BINARY_WRITER.reset(buf);
			BINARY_WRITER.writeU32(1);
			serializeRow(BINARY_WRITER, row);
			return backend.datastoreDeleteAllByEqBsatn(table_id, buf.buffer, BINARY_WRITER.offset) > 0;
		},
		clear: () => {
			const count = BigInt(backend.datastoreTableRowCount(table_id));
			backend.datastoreClear(table_id);
			return count;
		}
	};
	const tableView = Object.assign(/* @__PURE__ */ Object.create(null), tableMethods);
	for (const indexDef of table2.indexes) {
		const accessorName = indexDef.accessorName;
		const index_id = backend.indexIdFromName(namePrefix + indexDef.sourceName);
		let column_ids;
		let isHashIndex = false;
		switch (indexDef.algorithm.tag) {
			case "Hash":
				isHashIndex = true;
				column_ids = indexDef.algorithm.value;
				break;
			case "BTree":
				column_ids = indexDef.algorithm.value;
				break;
			case "Direct":
				column_ids = [indexDef.algorithm.value];
				break;
		}
		const numColumns = column_ids.length;
		const columnSet = new Set(column_ids);
		const isUnique = table2.constraints.filter((x) => x.data.tag === "Unique").some((x) => {
			const constraintColumns = new Set(x.data.value.columns);
			return [...columnSet].every((column) => constraintColumns.has(column));
		});
		const isPrimaryKey = isUnique && column_ids.length === table2.primaryKey.length && column_ids.every((id, i) => table2.primaryKey[i] === id);
		const indexSerializers = column_ids.map((id) => AlgebraicType.makeSerializer(rowType.value.elements[id].algebraicType, typespace));
		const serializePoint = (buffer, colVal) => {
			BINARY_WRITER.reset(buffer);
			for (let i = 0; i < numColumns; i++) indexSerializers[i](BINARY_WRITER, colVal[i]);
			return BINARY_WRITER.offset;
		};
		const serializeSingleElement = numColumns === 1 ? indexSerializers[0] : null;
		const serializeSinglePoint = serializeSingleElement && ((buffer, colVal) => {
			BINARY_WRITER.reset(buffer);
			serializeSingleElement(BINARY_WRITER, colVal);
			return BINARY_WRITER.offset;
		});
		let index;
		if (isUnique && serializeSinglePoint) {
			const base = {
				find: (colVal) => {
					const buf = LEAF_BUF;
					const point_len = serializeSinglePoint(buf, colVal);
					return tableIterateOne(backend.datastoreIndexScanPointBsatn(index_id, buf.buffer, point_len), deserializeRow, backend);
				},
				delete: (colVal) => {
					const buf = LEAF_BUF;
					const point_len = serializeSinglePoint(buf, colVal);
					return backend.datastoreDeleteByIndexScanPointBsatn(index_id, buf.buffer, point_len) > 0;
				}
			};
			if (isPrimaryKey) base.update = (row) => {
				const buf = LEAF_BUF;
				BINARY_WRITER.reset(buf);
				serializeRow(BINARY_WRITER, row);
				const generated = backend.datastoreUpdateBsatn(table_id, index_id, buf.buffer, BINARY_WRITER.offset);
				integrateGeneratedColumns?.(row, generatedColumnsView(generated, buf.view));
				return row;
			};
			index = base;
		} else if (isUnique) {
			const base = {
				find: (colVal) => {
					if (colVal.length !== numColumns) throw new TypeError("wrong number of elements");
					const buf = LEAF_BUF;
					const point_len = serializePoint(buf, colVal);
					return tableIterateOne(backend.datastoreIndexScanPointBsatn(index_id, buf.buffer, point_len), deserializeRow, backend);
				},
				delete: (colVal) => {
					if (colVal.length !== numColumns) throw new TypeError("wrong number of elements");
					const buf = LEAF_BUF;
					const point_len = serializePoint(buf, colVal);
					return backend.datastoreDeleteByIndexScanPointBsatn(index_id, buf.buffer, point_len) > 0;
				}
			};
			if (isPrimaryKey) base.update = (row) => {
				const buf = LEAF_BUF;
				BINARY_WRITER.reset(buf);
				serializeRow(BINARY_WRITER, row);
				const generated = backend.datastoreUpdateBsatn(table_id, index_id, buf.buffer, BINARY_WRITER.offset);
				integrateGeneratedColumns?.(row, generatedColumnsView(generated, buf.view));
				return row;
			};
			index = base;
		} else if (serializeSinglePoint) {
			const serializeSingleRange = !isHashIndex ? (buffer, range) => {
				BINARY_WRITER.reset(buffer);
				const writer = BINARY_WRITER;
				const writeBound = (bound) => {
					writer.writeU8({
						included: 0,
						excluded: 1,
						unbounded: 2
					}[bound.tag]);
					if (bound.tag !== "unbounded") serializeSingleElement(writer, bound.value);
				};
				writeBound(range.from);
				const rstartLen = writer.offset;
				writeBound(range.to);
				return [
					0,
					0,
					rstartLen,
					writer.offset - rstartLen
				];
			} : null;
			const rawIndex = {
				filter: (range) => {
					const buf = LEAF_BUF;
					if (serializeSingleRange && range instanceof Range) {
						const args = serializeSingleRange(buf, range);
						return tableIterator(backend.datastoreIndexScanRangeBsatn(index_id, buf.buffer, ...args), deserializeRow, backend);
					}
					const point_len = serializeSinglePoint(buf, range);
					return tableIterator(backend.datastoreIndexScanPointBsatn(index_id, buf.buffer, point_len), deserializeRow, backend);
				},
				delete: (range) => {
					const buf = LEAF_BUF;
					if (serializeSingleRange && range instanceof Range) {
						const args = serializeSingleRange(buf, range);
						return backend.datastoreDeleteByIndexScanRangeBsatn(index_id, buf.buffer, ...args);
					}
					const point_len = serializeSinglePoint(buf, range);
					return backend.datastoreDeleteByIndexScanPointBsatn(index_id, buf.buffer, point_len);
				}
			};
			if (isHashIndex) index = rawIndex;
			else index = rawIndex;
		} else if (isHashIndex) index = {
			filter: (range) => {
				const buf = LEAF_BUF;
				const point_len = serializePoint(buf, range);
				return tableIterator(backend.datastoreIndexScanPointBsatn(index_id, buf.buffer, point_len), deserializeRow, backend);
			},
			delete: (range) => {
				const buf = LEAF_BUF;
				const point_len = serializePoint(buf, range);
				return backend.datastoreDeleteByIndexScanPointBsatn(index_id, buf.buffer, point_len);
			}
		};
		else {
			const isCompleteScalarKey = (range) => {
				return range.length === numColumns && !(range[range.length - 1] instanceof Range);
			};
			const serializeRange = (buffer, range) => {
				if (range.length > numColumns) throw new TypeError("too many elements");
				BINARY_WRITER.reset(buffer);
				const writer = BINARY_WRITER;
				const prefix_elems = range.length - 1;
				for (let i = 0; i < prefix_elems; i++) indexSerializers[i](writer, range[i]);
				const rstartOffset = writer.offset;
				const term = range[range.length - 1];
				const serializeTerm = indexSerializers[range.length - 1];
				if (term instanceof Range) {
					const writeBound = (bound) => {
						writer.writeU8({
							included: 0,
							excluded: 1,
							unbounded: 2
						}[bound.tag]);
						if (bound.tag !== "unbounded") serializeTerm(writer, bound.value);
					};
					writeBound(term.from);
					const rstartLen = writer.offset - rstartOffset;
					writeBound(term.to);
					return [
						rstartOffset,
						prefix_elems,
						rstartLen,
						writer.offset - rstartOffset - rstartLen
					];
				} else {
					writer.writeU8(0);
					serializeTerm(writer, term);
					return [
						rstartOffset,
						prefix_elems,
						writer.offset - rstartOffset,
						0
					];
				}
			};
			index = {
				filter: (range) => {
					if (!Array.isArray(range)) range = [range];
					if (isCompleteScalarKey(range)) {
						const buf = LEAF_BUF;
						const point_len = serializePoint(buf, range);
						return tableIterator(backend.datastoreIndexScanPointBsatn(index_id, buf.buffer, point_len), deserializeRow, backend);
					} else {
						const buf = LEAF_BUF;
						const args = serializeRange(buf, range);
						return tableIterator(backend.datastoreIndexScanRangeBsatn(index_id, buf.buffer, ...args), deserializeRow, backend);
					}
				},
				delete: (range) => {
					if (!Array.isArray(range)) range = [range];
					if (isCompleteScalarKey(range)) {
						const buf = LEAF_BUF;
						const point_len = serializePoint(buf, range);
						return backend.datastoreDeleteByIndexScanPointBsatn(index_id, buf.buffer, point_len);
					} else {
						const buf = LEAF_BUF;
						const args = serializeRange(buf, range);
						return backend.datastoreDeleteByIndexScanRangeBsatn(index_id, buf.buffer, ...args);
					}
				}
			};
		}
		if (Object.hasOwn(tableView, accessorName)) freeze(Object.assign(tableView[accessorName], index));
		else tableView[accessorName] = freeze(index);
	}
	return freeze(tableView);
}
function* tableIterator(id, deserialize, backend = hostBackend) {
	const iter = new IteratorHandle(id, backend);
	const iterBuf = takeBuf();
	try {
		let amt;
		while (amt = iter.advance(iterBuf)) {
			const reader = new BinaryReader(iterBuf.view);
			while (reader.offset < amt) yield deserialize(reader);
		}
	} finally {
		iter[Symbol.dispose]();
		returnBuf(iterBuf);
	}
}
function tableIterateOne(id, deserialize, backend = hostBackend) {
	const buf = LEAF_BUF;
	if (advanceIterRaw(id, buf, backend) !== 0) {
		BINARY_READER.reset(buf.view);
		return deserialize(BINARY_READER);
	}
	return null;
}
function advanceIterRaw(id, buf, backend = hostBackend) {
	while (true) try {
		return 0 | backend.rowIterBsatnAdvance(id, buf.buffer);
	} catch (e) {
		if (e && typeof e === "object" && hasOwn(e, "__buffer_too_small__")) {
			buf.grow(e.__buffer_too_small__);
			continue;
		}
		throw e;
	}
}
var DEFAULT_BUFFER_CAPACITY = 32 * 1024 * 2;
var ITER_BUFS = [new ResizableBuffer(DEFAULT_BUFFER_CAPACITY)];
var ITER_BUF_COUNT = 1;
function takeBuf() {
	return ITER_BUF_COUNT ? ITER_BUFS[--ITER_BUF_COUNT] : new ResizableBuffer(DEFAULT_BUFFER_CAPACITY);
}
function returnBuf(buf) {
	ITER_BUFS[ITER_BUF_COUNT++] = buf;
}
var LEAF_BUF = new ResizableBuffer(DEFAULT_BUFFER_CAPACITY);
var IteratorHandle = class _IteratorHandle {
	#id;
	#backend;
	static #finalizationRegistry = new FinalizationRegistry(({ id, backend }) => backend.rowIterBsatnClose(id));
	constructor(id, backend = hostBackend) {
		this.#id = id;
		this.#backend = backend;
		_IteratorHandle.#finalizationRegistry.register(this, {
			id,
			backend
		}, this);
	}
	/** Unregister this object with the finalization registry and return the id */
	#detach() {
		const id = this.#id;
		this.#id = -1;
		_IteratorHandle.#finalizationRegistry.unregister(this);
		return id;
	}
	/** Call `row_iter_bsatn_advance`, returning 0 if this iterator has been exhausted. */
	advance(buf) {
		if (this.#id === -1) return 0;
		const ret = advanceIterRaw(this.#id, buf, this.#backend);
		if (ret <= 0) this.#detach();
		return ret < 0 ? -ret : ret;
	}
	[Symbol.dispose]() {
		if (this.#id >= 0) {
			const id = this.#detach();
			this.#backend.rowIterBsatnClose(id);
		}
	}
};
var { freeze: freeze2 } = Object;
var requestBaseSize = bsatnBaseSize({ types: [] }, HttpRequest.algebraicType);
function fetch(url, init = {}) {
	const method = serializeMethod(init.method);
	const headers = serializeHeaders(new Headers(init.headers));
	const uri = "" + url;
	const request = freeze2({
		method,
		headers,
		timeout: init.timeout,
		uri,
		version: { tag: "Http11" }
	});
	const requestBuf = new BinaryWriter(requestBaseSize);
	HttpRequest.serialize(requestBuf, request);
	const body = init.body == null ? new Uint8Array() : typeof init.body === "string" ? init.body : new Uint8Array(init.body);
	const [responseBuf, responseBody] = sys2.procedure_http_request(requestBuf.getBuffer(), body);
	const response = HttpResponse.deserialize(new BinaryReader(responseBuf));
	return SyncResponse[makeResponse](responseBody, {
		type: "basic",
		url: uri,
		status: response.code,
		statusText: import_statuses.default.message[response.code] ?? "",
		headers: deserializeHeaders(response.headers),
		aborted: false,
		version: response.version
	});
}
freeze2(fetch);
var httpClient = freeze2({ fetch });
function makeProcedureExport(ctx, opts, params, ret, fn) {
	const name = opts?.name;
	const procedureExport = (...args) => fn(...args);
	procedureExport[exportContext] = ctx;
	procedureExport[registerExport] = (ctx2, exportName) => {
		registerProcedure(ctx2, name ?? exportName, params, ret, fn);
		ctx2.functionExports.set(procedureExport, name ?? exportName);
		if (opts?.onSchedule !== void 0) ctx2.pendingSchedules.push({
			table: opts.onSchedule,
			functionName: name ?? exportName
		});
	};
	return procedureExport;
}
function registerProcedure(ctx, exportName, params, ret, fn, opts) {
	ctx.defineFunction(exportName);
	const paramsType = { elements: Object.entries(params).map(([n, c]) => ({
		name: n,
		algebraicType: ctx.registerTypesRecursively("typeBuilder" in c ? c.typeBuilder : c).algebraicType
	})) };
	const returnType = ctx.registerTypesRecursively(ret).algebraicType;
	ctx.moduleDef.procedures.push({
		sourceName: exportName,
		params: paramsType,
		returnType,
		visibility: FunctionVisibility.ClientCallable
	});
	const { typespace } = ctx;
	ctx.procedures.push({
		fn,
		deserializeArgs: ProductType.makeDeserializer(paramsType, typespace),
		serializeReturn: AlgebraicType.makeSerializer(returnType, typespace),
		returnTypeBaseSize: bsatnBaseSize(typespace, returnType)
	});
}
function callProcedure(procedures, id, sender, connectionId, timestamp, argsBuf, dbView, dispatches = [], parentPrefix = "") {
	const { fn, deserializeArgs, serializeReturn, returnTypeBaseSize } = procedures[id];
	const args = deserializeArgs(new BinaryReader(argsBuf));
	const ret = callUserFunction(fn, new ProcedureCtxImpl(sender, timestamp, connectionId, dbView, hostBackend, httpClient, void 0, void 0, void 0, dispatches, parentPrefix), args);
	const retBuf = new BinaryWriter(returnTypeBaseSize);
	serializeReturn(retBuf, ret);
	return retBuf.getBuffer();
}
var ProcedureCtxImpl = class ProcedureCtx {
	constructor(sender, timestamp, connectionId, dbView, backend = hostBackend, http = httpClient, sleep = () => {
		throw new Error("procedure sleep is not available in this runtime");
	}, random, childSeedRandom, dispatches = [], parentPrefix = "") {
		this.sender = sender;
		this.timestamp = timestamp;
		this.connectionId = connectionId;
		this.#dbView = dbView;
		this.#backend = backend;
		this.#http = http;
		this.#sleep = sleep;
		this.#random = random;
		this.#childSeedRandom = childSeedRandom;
		this.#dispatches = dispatches;
		this.#parentPrefix = parentPrefix;
	}
	#identity;
	#uuidCounter;
	#random;
	#dbView;
	#backend;
	#http;
	#sleep;
	#childSeedRandom;
	env = environment;
	#dispatches;
	#parentPrefix;
	#asViews;
	get databaseIdentity() {
		return this.#identity ??= new Identity(this.#backend.identity());
	}
	get identity() {
		return this.databaseIdentity;
	}
	get random() {
		return this.#random ??= makeRandom(this.timestamp);
	}
	get http() {
		return this.#http;
	}
	sleep(duration) {
		this.#sleep(duration);
	}
	get as() {
		return this.#asViews ??= buildProcedureAliasCtxMap(this, this.#dispatches, this.#parentPrefix);
	}
	withTx(body) {
		const txSeed = this.#childSeedRandom?.bigintInRange(0n, (1n << 64n) - 1n);
		const dispatches = this.#dispatches;
		const parentPrefix = this.#parentPrefix;
		return runWithTx((timestamp) => {
			const tx = new ReducerCtxImpl(this.sender, timestamp, this.connectionId, this.#dbView(), this.#backend, void 0, txSeed == null ? void 0 : makeRandomFromSeed(txSeed));
			assignTxAliasViews(tx, dispatches, parentPrefix);
			return tx;
		}, body, this.#backend);
	}
	newUuidV4() {
		const bytes = this.random.fill(new Uint8Array(16));
		return Uuid.fromRandomBytesV4(bytes);
	}
	newUuidV7() {
		const bytes = this.random.fill(new Uint8Array(4));
		const counter = this.#uuidCounter ??= { value: 0 };
		return Uuid.fromCounterV7(counter, this.timestamp, bytes);
	}
};
function makeReducerExport(ctx, opts, params, fn, lifecycle) {
	const reducerExport = (...args) => fn(...args);
	reducerExport[exportContext] = ctx;
	reducerExport[registerExport] = (ctx2, exportName) => {
		registerReducer(ctx2, exportName, params, fn, opts, lifecycle);
		ctx2.functionExports.set(reducerExport, exportName);
		if (opts?.onSchedule !== void 0) ctx2.pendingSchedules.push({
			table: opts.onSchedule,
			functionName: exportName
		});
	};
	return reducerExport;
}
function registerReducer(ctx, exportName, params, fn, opts, lifecycle) {
	ctx.defineFunction(exportName);
	if (!(params instanceof RowBuilder)) params = new RowBuilder(params);
	if (params.typeName === void 0) params.typeName = toPascalCase(exportName);
	const ref = ctx.registerTypesRecursively(params);
	const paramsType = ctx.resolveType(ref).value;
	const isLifecycle = lifecycle != null;
	ctx.moduleDef.reducers.push({
		sourceName: exportName,
		params: paramsType,
		visibility: FunctionVisibility.ClientCallable,
		okReturnType: AlgebraicType.Product({ elements: [] }),
		errReturnType: AlgebraicType.String
	});
	if (opts?.name != null) ctx.moduleDef.explicitNames.entries.push({
		tag: "Function",
		value: {
			sourceName: exportName,
			canonicalName: opts.name
		}
	});
	if (isLifecycle) ctx.moduleDef.lifeCycleReducers.push({
		lifecycleSpec: lifecycle,
		functionName: exportName
	});
	if (!fn.name) Object.defineProperty(fn, "name", {
		value: exportName,
		writable: false
	});
	ctx.reducers.push(fn);
}
var SchemaInner = class extends ModuleContext {
	schemaType;
	exportsRegistered = false;
	schedulesResolved = false;
	existingFunctions = /* @__PURE__ */ new Set();
	existingHttpHandlers = /* @__PURE__ */ new Set();
	reducers = [];
	procedures = [];
	views = [];
	anonViews = [];
	httpHandlers = [];
	/**
	* Maps reducer/procedure export objects to their source names.
	* Used for resolving scheduled table targets.
	*/
	functionExports = /* @__PURE__ */ new Map();
	tableSourceNames = /* @__PURE__ */ new Map();
	httpHandlerExports = /* @__PURE__ */ new Map();
	pendingSchedules = [];
	pendingHttpRoutes = [];
	submoduleDispatchInfos = [];
	constructor(getSchemaType) {
		super();
		this.schemaType = getSchemaType(this);
	}
	defineFunction(name) {
		if (this.existingFunctions.has(name)) throw new TypeError(`There is already a reducer, procedure, or view with the name '${name}'`);
		this.existingFunctions.add(name);
	}
	defineHttpHandler(name) {
		if (this.existingHttpHandlers.has(name)) throw new TypeError(`There is already an HTTP handler with the name '${name}'`);
		this.existingHttpHandlers.add(name);
	}
	resolveSchedules() {
		if (this.schedulesResolved) return;
		this.schedulesResolved = true;
		const scheduledTables = /* @__PURE__ */ new Map();
		for (const { functionName: knownFunctionName, reducer, table: table2, tableName: knownTableName, scheduleAtCol: knownScheduleAtCol } of this.pendingSchedules) {
			let tableName = knownTableName;
			if (tableName === void 0) {
				const tableNames = this.tableSourceNames.get(table2);
				if (tableNames !== void 0 && tableNames.length > 1) throw new TypeError("Schedule target table is registered more than once in this schema. Use a distinct table handle for each scheduled table.");
				tableName = tableNames?.[0];
			}
			if (tableName === void 0) throw new TypeError("Schedule target table is not part of this schema.");
			const scheduleAtCol = knownScheduleAtCol ?? table2.scheduleAtCol;
			if (scheduleAtCol === void 0) throw new TypeError(`Table ${tableName} defines a schedule, but it does not have a ScheduleAt column.`);
			const functionName = knownFunctionName ?? (reducer === void 0 ? void 0 : this.functionExports.get(reducer()));
			if (functionName === void 0) {
				const msg = `Table ${tableName} defines a schedule, but it seems like the associated function was not exported.`;
				throw new TypeError(msg);
			}
			const existingFunctionName = scheduledTables.get(tableName);
			if (existingFunctionName !== void 0) throw new TypeError(`Table ${tableName} defines multiple schedules: ${existingFunctionName} and ${functionName}. A schedule table can only be used by one reducer or procedure.`);
			scheduledTables.set(tableName, functionName);
			this.moduleDef.schedules.push({
				sourceName: void 0,
				tableName,
				scheduleAtCol,
				functionName
			});
		}
	}
	resolveHttpRoutes() {
		for (const route of this.pendingHttpRoutes) {
			const handlerFunction = this.httpHandlerExports.get(route.handler);
			if (handlerFunction === void 0) throw new TypeError(`HTTP route for path '${route.path}' refers to a handler that was not exported.`);
			this.moduleDef.httpRoutes.push({
				handlerFunction,
				method: route.method,
				path: route.path
			});
		}
	}
};
var Schema = class {
	#ctx;
	constructor(ctx) {
		this.#ctx = ctx;
	}
	[moduleHooks](exports) {
		this.buildRawModuleDefV10(exports);
		this.#ctx.resolveHttpRoutes();
		return makeHooks(this.#ctx);
	}
	get schemaType() {
		return this.#ctx.schemaType;
	}
	get moduleDef() {
		return this.#ctx.moduleDef;
	}
	get typespace() {
		return this.#ctx.typespace;
	}
	get submoduleDispatchInfos() {
		return this.#ctx.submoduleDispatchInfos;
	}
	/** Internal: register exports and materialize the RawModuleDefV10 for upload. */
	buildRawModuleDefV10(exports, opts) {
		registerModuleExports(this.#ctx, exports, { ignoreNonModuleExports: opts?.ignoreNonModuleExports ?? false });
		this.#ctx.resolveSchedules();
		return this.#ctx.rawModuleDefV10();
	}
	/**
	* @internal – called by schema() when processing a submodule namespace entry.
	* Registers the library's exports and returns both the serialized module def
	* and the runtime dispatch info needed by ModuleHooksImpl for __call_reducer__.
	*/
	buildSubmoduleDispatch(exports) {
		const rawDef = this.buildRawModuleDefV10(exports, { ignoreNonModuleExports: true });
		if (this.#ctx.moduleDef.environment.length !== 0) throw new TypeError("Submodules cannot declare environment variables");
		this.#ctx.resolveHttpRoutes();
		return {
			rawDef,
			dispatch: {
				namespace: "",
				reducerFns: [...this.#ctx.reducers],
				reducerDefs: [...this.#ctx.moduleDef.reducers],
				procedureFns: [...this.#ctx.procedures],
				procedureDefs: [...this.#ctx.moduleDef.procedures],
				anonViewFns: [...this.#ctx.anonViews],
				viewFns: [...this.#ctx.views],
				typespace: this.#ctx.moduleDef.typespace,
				tables: Object.values(this.#ctx.schemaType.tables).map((t2) => ({
					accessorName: t2.accessorName,
					tableDef: t2.tableDef
				})),
				schemaTables: this.#ctx.schemaType.tables,
				subDispatches: [...this.#ctx.submoduleDispatchInfos]
			}
		};
	}
	reducer(...args) {
		let opts, params = {}, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2: {
				let arg1;
				[arg1, fn] = args;
				if (typeof arg1.name === "string") opts = arg1;
				else params = arg1;
				break;
			}
			case 3:
				[opts, params, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, params, fn);
	}
	init(...args) {
		let opts, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2:
				[opts, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, {}, fn, Lifecycle.Init);
	}
	clientConnected(...args) {
		let opts, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2:
				[opts, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, {}, fn, Lifecycle.OnConnect);
	}
	clientDisconnected(...args) {
		let opts, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2:
				[opts, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, {}, fn, Lifecycle.OnDisconnect);
	}
	view(opts, ...args) {
		let params = {}, ret, fn;
		switch (args.length) {
			case 2:
				[ret, fn] = args;
				break;
			case 3:
				[params, ret, fn] = args;
				break;
		}
		return makeViewExport(this.#ctx, opts, params, ret, fn);
	}
	anonymousView(opts, ...args) {
		let params = {}, ret, fn;
		switch (args.length) {
			case 2:
				[ret, fn] = args;
				break;
			case 3:
				[params, ret, fn] = args;
				break;
		}
		return makeAnonViewExport(this.#ctx, opts, params, ret, fn);
	}
	procedure(...args) {
		let opts, params = {}, ret, fn;
		switch (args.length) {
			case 2:
				[ret, fn] = args;
				break;
			case 3: {
				let arg1;
				[arg1, ret, fn] = args;
				if (typeof arg1.name === "string") opts = arg1;
				else params = arg1;
				break;
			}
			case 4:
				[opts, params, ret, fn] = args;
				break;
		}
		return makeProcedureExport(this.#ctx, opts, params, ret, fn);
	}
	httpHandler(...args) {
		let opts, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2:
				[opts, fn] = args;
				break;
		}
		return makeHttpHandlerExport(this.#ctx, opts, fn);
	}
	httpRouter(router) {
		return makeHttpRouterExport(this.#ctx, router);
	}
	/**
	* Bundle multiple reducers, procedures, etc into one value to export.
	* The name they will be exported with is their corresponding key in the `exports` argument.
	*/
	exportGroup(exports) {
		return {
			[exportContext]: this.#ctx,
			[registerExport](ctx, _exportName) {
				for (const [exportName, moduleExport] of Object.entries(exports)) {
					checkExportContext(moduleExport, ctx);
					moduleExport[registerExport](ctx, exportName);
				}
			}
		};
	}
	clientVisibilityFilter = { sql: (filter) => ({
		[exportContext]: this.#ctx,
		[registerExport](ctx, _exportName) {
			ctx.moduleDef.rowLevelSecurity.push({ sql: filter });
		}
	}) };
};
var registerExport = Symbol("SpacetimeDB.registerExport");
var exportContext = Symbol("SpacetimeDB.exportContext");
function isModuleExport(x) {
	return (typeof x === "function" || typeof x === "object") && x !== null && registerExport in x;
}
function checkExportContext(exp, schema2) {
	if (exp[exportContext] != null && exp[exportContext] !== schema2) throw new TypeError("multiple schemas are not supported");
}
function isUntypedTableSchema(x) {
	return typeof x === "object" && x !== null && hasOwn(x, "tableDef");
}
function isSubmoduleNamespace(x) {
	return typeof x === "object" && x !== null && hasOwn(x, "default") && x.default instanceof Schema;
}
function isSubmoduleMount(x) {
	return typeof x === "object" && x !== null && hasOwn(x, "module") && !hasOwn(x, "default") && !hasOwn(x, "tableDef");
}
function defaultImportError(accName) {
	return /* @__PURE__ */ new TypeError(`schema entry '${accName}' looks like a default import; use \`import * as ${accName} from '...'\` so the submodule can see the library's named reducer exports.`);
}
function resolveSubmoduleEntry(accName, entry) {
	if (entry instanceof Schema) throw defaultImportError(accName);
	if (isSubmoduleNamespace(entry)) return { submodule: entry };
	if (!isSubmoduleMount(entry)) return;
	if (entry.module instanceof Schema) throw defaultImportError(accName);
	if (!isSubmoduleNamespace(entry.module)) throw new TypeError(`schema entry '${accName}' has a \`module\` that is not a submodule namespace object; pass the result of \`import * as ${accName} from '...'\`.`);
	if (entry.name === void 0) return { submodule: entry.module };
	if (typeof entry.name !== "string" || entry.name.length === 0) throw new TypeError(`schema entry '${accName}' has an invalid \`name\`; expected a non-empty string for the canonical namespace name.`);
	return {
		submodule: entry.module,
		canonicalName: entry.name
	};
}
function registerModuleExports(schema2, exports, opts) {
	if (schema2.exportsRegistered) return;
	schema2.exportsRegistered = true;
	for (const [name, moduleExport] of Object.entries(exports)) {
		if (name === "default") continue;
		if (!isModuleExport(moduleExport)) {
			if (opts?.ignoreNonModuleExports) continue;
			throw new TypeError("exporting something that is not a spacetime export");
		}
		checkExportContext(moduleExport, schema2);
		moduleExport[registerExport](schema2, name);
	}
}
function schema(entries, moduleSettings) {
	return new Schema(new SchemaInner((ctx2) => {
		ctx2.moduleDef.environment = environmentDeclarations(moduleSettings?.env ?? {});
		if (moduleSettings?.CASE_CONVERSION_POLICY != null) ctx2.setCaseConversionPolicy(moduleSettings.CASE_CONVERSION_POLICY);
		const tableSchemas = {};
		for (const [accName, entry] of Object.entries(entries)) {
			const mount = resolveSubmoduleEntry(accName, entry);
			if (mount !== void 0) {
				const { submodule, canonicalName } = mount;
				const { rawDef, dispatch } = submodule.default.buildSubmoduleDispatch(submodule);
				dispatch.namespace = accName;
				ctx2.addSubmodule({
					namespace: accName,
					module: rawDef
				});
				if (canonicalName !== void 0) ctx2.moduleDef.explicitNames.entries.push({
					tag: "Namespace",
					value: {
						sourceName: accName,
						canonicalName
					}
				});
				ctx2.submoduleDispatchInfos.push(dispatch);
				continue;
			}
			if (!isUntypedTableSchema(entry)) throw new TypeError(`schema entry '${accName}' must be a table, a submodule namespace object, or a \`{ name, module }\` submodule mount`);
			const table2 = entry;
			const tableDef = table2.tableDef(ctx2, accName);
			tableSchemas[accName] = tableToSchema(accName, table2, tableDef);
			const tableSourceNames = ctx2.tableSourceNames.get(table2);
			if (tableSourceNames === void 0) ctx2.tableSourceNames.set(table2, [tableDef.sourceName]);
			else tableSourceNames.push(tableDef.sourceName);
			ctx2.moduleDef.tables.push(tableDef);
			if (table2.schedule) ctx2.pendingSchedules.push({
				table: table2,
				tableName: tableDef.sourceName,
				scheduleAtCol: table2.schedule.scheduleAtCol,
				reducer: table2.schedule.reducer
			});
			if (table2.tableName) ctx2.moduleDef.explicitNames.entries.push({
				tag: "Table",
				value: {
					sourceName: accName,
					canonicalName: table2.tableName
				}
			});
		}
		return {
			tables: tableSchemas,
			env: moduleSettings?.env ?? {}
		};
	}));
}
var import_object_inspect = __toESM(require_object_inspect());
var fmtLog = (...data) => data.map((x) => typeof x === "string" ? x : (0, import_object_inspect.default)(x)).join(" ");
var console_level_error = 0;
var console_level_warn = 1;
var console_level_info = 2;
var console_level_debug = 3;
var console_level_trace = 4;
var timerMap = /* @__PURE__ */ new Map();
var console2 = {
	__proto__: {},
	[Symbol.toStringTag]: "console",
	assert: (condition = false, ...data) => {
		if (!condition) sys2.console_log(console_level_error, fmtLog(...data));
	},
	clear: () => {},
	debug: (...data) => {
		sys2.console_log(console_level_debug, fmtLog(...data));
	},
	error: (...data) => {
		sys2.console_log(console_level_error, fmtLog(...data));
	},
	info: (...data) => {
		sys2.console_log(console_level_info, fmtLog(...data));
	},
	log: (...data) => {
		sys2.console_log(console_level_info, fmtLog(...data));
	},
	table: (tabularData, _properties) => {
		sys2.console_log(console_level_info, fmtLog(tabularData));
	},
	trace: (...data) => {
		sys2.console_log(console_level_trace, fmtLog(...data));
	},
	warn: (...data) => {
		sys2.console_log(console_level_warn, fmtLog(...data));
	},
	dir: (_item, _options) => {},
	dirxml: (..._data) => {},
	count: (_label = "default") => {},
	countReset: (_label = "default") => {},
	group: (..._data) => {},
	groupCollapsed: (..._data) => {},
	groupEnd: () => {},
	time: (label = "default") => {
		if (timerMap.has(label)) {
			sys2.console_log(console_level_warn, `Timer '${label}' already exists.`);
			return;
		}
		timerMap.set(label, sys2.console_timer_start(label));
	},
	timeLog: (label = "default", ...data) => {
		sys2.console_log(console_level_info, fmtLog(label, ...data));
	},
	timeEnd: (label = "default") => {
		const spanId = timerMap.get(label);
		if (spanId === void 0) {
			sys2.console_log(console_level_warn, `Timer '${label}' does not exist.`);
			return;
		}
		sys2.console_timer_end(spanId);
		timerMap.delete(label);
	},
	timeStamp: () => {},
	profile: () => {},
	profileEnd: () => {}
};
globalThis.console = console2;

//#endregion
//#region src/index.ts
const spacetimedb = schema({
	writer: table({ name: "writer" }, { identity: t.identity().primaryKey() }),
	claim: table({
		name: "claim",
		public: true
	}, {
		claimId: t.string().primaryKey(),
		vehicle: t.string(),
		step: t.string(),
		offerTotal: t.f64(),
		counterofferTotal: t.f64(),
		checksFailed: t.u32(),
		walkAway: t.f64(),
		deposit: t.f64(),
		updatedAt: t.timestamp()
	}),
	claimEvent: table({
		name: "claim_event",
		public: true
	}, {
		id: t.u64().primaryKey().autoInc(),
		claimId: t.string().index("btree"),
		kind: t.string(),
		detail: t.string(),
		at: t.timestamp()
	})
});
const claimWriter = spacetimedb.reducer((ctx) => {
	if (ctx.db.writer.count() > 0n) throw new SenderError("A writer is already registered");
	ctx.db.writer.insert({ identity: ctx.sender });
});
const recordEvent = spacetimedb.reducer({
	claimId: t.string(),
	kind: t.string(),
	detail: t.string(),
	vehicle: t.string(),
	offerTotal: t.f64(),
	counterofferTotal: t.f64(),
	checksFailed: t.u32(),
	walkAway: t.f64(),
	deposit: t.f64()
}, (ctx, a) => {
	if (!ctx.db.writer.identity.find(ctx.sender)) throw new SenderError("Not authorized");
	ctx.db.claimEvent.insert({
		id: 0n,
		claimId: a.claimId,
		kind: a.kind,
		detail: a.detail,
		at: ctx.timestamp
	});
	const row = {
		claimId: a.claimId,
		vehicle: a.vehicle,
		step: a.kind,
		offerTotal: a.offerTotal,
		counterofferTotal: a.counterofferTotal,
		checksFailed: a.checksFailed,
		walkAway: a.walkAway,
		deposit: a.deposit,
		updatedAt: ctx.timestamp
	};
	if (ctx.db.claim.claimId.find(a.claimId)) ctx.db.claim.claimId.update(row);
	else ctx.db.claim.insert(row);
});

//#endregion
export { claimWriter, spacetimedb as default, recordEvent };
//# debugId=ac116c5a-4d07-497e-b16a-3e40f95c4d39
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibmFtZXMiOlsiX19jcmVhdGUiLCJfX2RlZlByb3AiLCJfX2dldE93blByb3BEZXNjIiwiX19nZXRPd25Qcm9wTmFtZXMiLCJfX2dldFByb3RvT2YiLCJfX2hhc093blByb3AiLCJfX2NvbW1vbkpTIiwiX19jb3B5UHJvcHMiLCJfX3RvRVNNIiwiI2Vuc3VyZSIsIiNtb2R1bGVEZWYiLCIjcmVnaXN0ZXJDb21wb3VuZFR5cGVSZWN1cnNpdmVseSIsIiNjb21wb3VuZFR5cGVzIiwiI2JvZHkiLCIjaW5uZXIiLCIjZnJvbSIsIiN0byIsIiNiYWNrZW5kIiwiI3NlbmRlckF1dGgiLCIjcmFuZG9tIiwiI3V1aWRDb3VudGVyIiwiI2lkZW50aXR5IiwiI3NjaGVtYSIsIiNjb25zdW1lclJlZHVjZXJDb3VudCIsIiNjb25zdW1lclByb2NlZHVyZUNvdW50IiwiI2NvbnN1bWVyQW5vblZpZXdDb3VudCIsIiNjb25zdW1lclZpZXdDb3VudCIsIiNmbGF0U3VibW9kdWxlcyIsIiNyZWR1Y2VyQXJnc0Rlc2VyaWFsaXplcnMiLCIjZGJWaWV3IiwiI2RiVmlld18iLCIjc3VibW9kdWxlQXNWaWV3c18iLCIjcmVkdWNlckN0eCIsIiNyZWR1Y2VyQ3R4XyIsIiNjb25zdW1lckFzIiwiI2NvbnN1bWVyQXNfIiwiI2dldFN1Ym1vZHVsZURiVmlldyIsIiNnZXRTdWJtb2R1bGVBc1ZpZXdzIiwiI2dldFN1Ym1vZHVsZVF1ZXJ5QnVpbGRlciIsIiNkaXNwYXRjaGVzIiwiI2FzVmlld3MiLCIjZmluYWxpemF0aW9uUmVnaXN0cnkiLCIjaWQiLCIjZGV0YWNoIiwiI2h0dHAiLCIjc2xlZXAiLCIjY2hpbGRTZWVkUmFuZG9tIiwiI3BhcmVudFByZWZpeCIsIiNjdHgiXSwic291cmNlcyI6WyJub2RlX21vZHVsZXMvaGVhZGVycy1wb2x5ZmlsbC9saWIvaW5kZXgubWpzIiwibm9kZV9tb2R1bGVzL3NwYWNldGltZWRiL2Rpc3Qvc2VydmVyL2luZGV4Lm1qcyIsInNyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgX19jcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xudmFyIF9fZGVmUHJvcCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcbnZhciBfX2dldE93blByb3BEZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbnZhciBfX2dldE93blByb3BOYW1lcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzO1xudmFyIF9fZ2V0UHJvdG9PZiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcbnZhciBfX2hhc093blByb3AgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIF9fY29tbW9uSlMgPSAoY2IsIG1vZCkgPT4gZnVuY3Rpb24gX19yZXF1aXJlKCkge1xuICByZXR1cm4gbW9kIHx8ICgwLCBjYltfX2dldE93blByb3BOYW1lcyhjYilbMF1dKSgobW9kID0geyBleHBvcnRzOiB7fSB9KS5leHBvcnRzLCBtb2QpLCBtb2QuZXhwb3J0cztcbn07XG52YXIgX19jb3B5UHJvcHMgPSAodG8sIGZyb20sIGV4Y2VwdCwgZGVzYykgPT4ge1xuICBpZiAoZnJvbSAmJiB0eXBlb2YgZnJvbSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgZnJvbSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgZm9yIChsZXQga2V5IG9mIF9fZ2V0T3duUHJvcE5hbWVzKGZyb20pKVxuICAgICAgaWYgKCFfX2hhc093blByb3AuY2FsbCh0bywga2V5KSAmJiBrZXkgIT09IGV4Y2VwdClcbiAgICAgICAgX19kZWZQcm9wKHRvLCBrZXksIHsgZ2V0OiAoKSA9PiBmcm9tW2tleV0sIGVudW1lcmFibGU6ICEoZGVzYyA9IF9fZ2V0T3duUHJvcERlc2MoZnJvbSwga2V5KSkgfHwgZGVzYy5lbnVtZXJhYmxlIH0pO1xuICB9XG4gIHJldHVybiB0bztcbn07XG52YXIgX190b0VTTSA9IChtb2QsIGlzTm9kZU1vZGUsIHRhcmdldCkgPT4gKHRhcmdldCA9IG1vZCAhPSBudWxsID8gX19jcmVhdGUoX19nZXRQcm90b09mKG1vZCkpIDoge30sIF9fY29weVByb3BzKFxuICAvLyBJZiB0aGUgaW1wb3J0ZXIgaXMgaW4gbm9kZSBjb21wYXRpYmlsaXR5IG1vZGUgb3IgdGhpcyBpcyBub3QgYW4gRVNNXG4gIC8vIGZpbGUgdGhhdCBoYXMgYmVlbiBjb252ZXJ0ZWQgdG8gYSBDb21tb25KUyBmaWxlIHVzaW5nIGEgQmFiZWwtXG4gIC8vIGNvbXBhdGlibGUgdHJhbnNmb3JtIChpLmUuIFwiX19lc01vZHVsZVwiIGhhcyBub3QgYmVlbiBzZXQpLCB0aGVuIHNldFxuICAvLyBcImRlZmF1bHRcIiB0byB0aGUgQ29tbW9uSlMgXCJtb2R1bGUuZXhwb3J0c1wiIGZvciBub2RlIGNvbXBhdGliaWxpdHkuXG4gIGlzTm9kZU1vZGUgfHwgIW1vZCB8fCAhbW9kLl9fZXNNb2R1bGUgPyBfX2RlZlByb3AodGFyZ2V0LCBcImRlZmF1bHRcIiwgeyB2YWx1ZTogbW9kLCBlbnVtZXJhYmxlOiB0cnVlIH0pIDogdGFyZ2V0LFxuICBtb2RcbikpO1xuXG4vLyBub2RlX21vZHVsZXMvc2V0LWNvb2tpZS1wYXJzZXIvbGliL3NldC1jb29raWUuanNcbnZhciByZXF1aXJlX3NldF9jb29raWUgPSBfX2NvbW1vbkpTKHtcbiAgXCJub2RlX21vZHVsZXMvc2V0LWNvb2tpZS1wYXJzZXIvbGliL3NldC1jb29raWUuanNcIihleHBvcnRzLCBtb2R1bGUpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgZGVmYXVsdFBhcnNlT3B0aW9ucyA9IHtcbiAgICAgIGRlY29kZVZhbHVlczogdHJ1ZSxcbiAgICAgIG1hcDogZmFsc2UsXG4gICAgICBzaWxlbnQ6IGZhbHNlXG4gICAgfTtcbiAgICBmdW5jdGlvbiBpc05vbkVtcHR5U3RyaW5nKHN0cikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBzdHIgPT09IFwic3RyaW5nXCIgJiYgISFzdHIudHJpbSgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBwYXJzZVN0cmluZyhzZXRDb29raWVWYWx1ZSwgb3B0aW9ucykge1xuICAgICAgdmFyIHBhcnRzID0gc2V0Q29va2llVmFsdWUuc3BsaXQoXCI7XCIpLmZpbHRlcihpc05vbkVtcHR5U3RyaW5nKTtcbiAgICAgIHZhciBuYW1lVmFsdWVQYWlyU3RyID0gcGFydHMuc2hpZnQoKTtcbiAgICAgIHZhciBwYXJzZWQgPSBwYXJzZU5hbWVWYWx1ZVBhaXIobmFtZVZhbHVlUGFpclN0cik7XG4gICAgICB2YXIgbmFtZSA9IHBhcnNlZC5uYW1lO1xuICAgICAgdmFyIHZhbHVlID0gcGFyc2VkLnZhbHVlO1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgPyBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0UGFyc2VPcHRpb25zLCBvcHRpb25zKSA6IGRlZmF1bHRQYXJzZU9wdGlvbnM7XG4gICAgICB0cnkge1xuICAgICAgICB2YWx1ZSA9IG9wdGlvbnMuZGVjb2RlVmFsdWVzID8gZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSA6IHZhbHVlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgIFwic2V0LWNvb2tpZS1wYXJzZXIgZW5jb3VudGVyZWQgYW4gZXJyb3Igd2hpbGUgZGVjb2RpbmcgYSBjb29raWUgd2l0aCB2YWx1ZSAnXCIgKyB2YWx1ZSArIFwiJy4gU2V0IG9wdGlvbnMuZGVjb2RlVmFsdWVzIHRvIGZhbHNlIHRvIGRpc2FibGUgdGhpcyBmZWF0dXJlLlwiLFxuICAgICAgICAgIGVcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHZhciBjb29raWUgPSB7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIHZhbHVlXG4gICAgICB9O1xuICAgICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KSB7XG4gICAgICAgIHZhciBzaWRlcyA9IHBhcnQuc3BsaXQoXCI9XCIpO1xuICAgICAgICB2YXIga2V5ID0gc2lkZXMuc2hpZnQoKS50cmltTGVmdCgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHZhciB2YWx1ZTIgPSBzaWRlcy5qb2luKFwiPVwiKTtcbiAgICAgICAgaWYgKGtleSA9PT0gXCJleHBpcmVzXCIpIHtcbiAgICAgICAgICBjb29raWUuZXhwaXJlcyA9IG5ldyBEYXRlKHZhbHVlMik7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSBcIm1heC1hZ2VcIikge1xuICAgICAgICAgIGNvb2tpZS5tYXhBZ2UgPSBwYXJzZUludCh2YWx1ZTIsIDEwKTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IFwic2VjdXJlXCIpIHtcbiAgICAgICAgICBjb29raWUuc2VjdXJlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IFwiaHR0cG9ubHlcIikge1xuICAgICAgICAgIGNvb2tpZS5odHRwT25seSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSBcInNhbWVzaXRlXCIpIHtcbiAgICAgICAgICBjb29raWUuc2FtZVNpdGUgPSB2YWx1ZTI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29va2llW2tleV0gPSB2YWx1ZTI7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGNvb2tpZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcGFyc2VOYW1lVmFsdWVQYWlyKG5hbWVWYWx1ZVBhaXJTdHIpIHtcbiAgICAgIHZhciBuYW1lID0gXCJcIjtcbiAgICAgIHZhciB2YWx1ZSA9IFwiXCI7XG4gICAgICB2YXIgbmFtZVZhbHVlQXJyID0gbmFtZVZhbHVlUGFpclN0ci5zcGxpdChcIj1cIik7XG4gICAgICBpZiAobmFtZVZhbHVlQXJyLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgbmFtZSA9IG5hbWVWYWx1ZUFyci5zaGlmdCgpO1xuICAgICAgICB2YWx1ZSA9IG5hbWVWYWx1ZUFyci5qb2luKFwiPVwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gbmFtZVZhbHVlUGFpclN0cjtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IG5hbWUsIHZhbHVlIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIHBhcnNlKGlucHV0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyA/IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRQYXJzZU9wdGlvbnMsIG9wdGlvbnMpIDogZGVmYXVsdFBhcnNlT3B0aW9ucztcbiAgICAgIGlmICghaW5wdXQpIHtcbiAgICAgICAgaWYgKCFvcHRpb25zLm1hcCkge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpbnB1dC5oZWFkZXJzKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQuaGVhZGVycy5nZXRTZXRDb29raWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIGlucHV0ID0gaW5wdXQuaGVhZGVycy5nZXRTZXRDb29raWUoKTtcbiAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5oZWFkZXJzW1wic2V0LWNvb2tpZVwiXSkge1xuICAgICAgICAgIGlucHV0ID0gaW5wdXQuaGVhZGVyc1tcInNldC1jb29raWVcIl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHNjaCA9IGlucHV0LmhlYWRlcnNbT2JqZWN0LmtleXMoaW5wdXQuaGVhZGVycykuZmluZChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gXCJzZXQtY29va2llXCI7XG4gICAgICAgICAgfSldO1xuICAgICAgICAgIGlmICghc2NoICYmIGlucHV0LmhlYWRlcnMuY29va2llICYmICFvcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICBcIldhcm5pbmc6IHNldC1jb29raWUtcGFyc2VyIGFwcGVhcnMgdG8gaGF2ZSBiZWVuIGNhbGxlZCBvbiBhIHJlcXVlc3Qgb2JqZWN0LiBJdCBpcyBkZXNpZ25lZCB0byBwYXJzZSBTZXQtQ29va2llIGhlYWRlcnMgZnJvbSByZXNwb25zZXMsIG5vdCBDb29raWUgaGVhZGVycyBmcm9tIHJlcXVlc3RzLiBTZXQgdGhlIG9wdGlvbiB7c2lsZW50OiB0cnVlfSB0byBzdXBwcmVzcyB0aGlzIHdhcm5pbmcuXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlucHV0ID0gc2NoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG4gICAgICAgIGlucHV0ID0gW2lucHV0XTtcbiAgICAgIH1cbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zID8gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdFBhcnNlT3B0aW9ucywgb3B0aW9ucykgOiBkZWZhdWx0UGFyc2VPcHRpb25zO1xuICAgICAgaWYgKCFvcHRpb25zLm1hcCkge1xuICAgICAgICByZXR1cm4gaW5wdXQuZmlsdGVyKGlzTm9uRW1wdHlTdHJpbmcpLm1hcChmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgICByZXR1cm4gcGFyc2VTdHJpbmcoc3RyLCBvcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgY29va2llcyA9IHt9O1xuICAgICAgICByZXR1cm4gaW5wdXQuZmlsdGVyKGlzTm9uRW1wdHlTdHJpbmcpLnJlZHVjZShmdW5jdGlvbihjb29raWVzMiwgc3RyKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IHBhcnNlU3RyaW5nKHN0ciwgb3B0aW9ucyk7XG4gICAgICAgICAgY29va2llczJbY29va2llLm5hbWVdID0gY29va2llO1xuICAgICAgICAgIHJldHVybiBjb29raWVzMjtcbiAgICAgICAgfSwgY29va2llcyk7XG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNwbGl0Q29va2llc1N0cmluZzIoY29va2llc1N0cmluZykge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY29va2llc1N0cmluZykpIHtcbiAgICAgICAgcmV0dXJuIGNvb2tpZXNTdHJpbmc7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGNvb2tpZXNTdHJpbmcgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgICAgdmFyIGNvb2tpZXNTdHJpbmdzID0gW107XG4gICAgICB2YXIgcG9zID0gMDtcbiAgICAgIHZhciBzdGFydDtcbiAgICAgIHZhciBjaDtcbiAgICAgIHZhciBsYXN0Q29tbWE7XG4gICAgICB2YXIgbmV4dFN0YXJ0O1xuICAgICAgdmFyIGNvb2tpZXNTZXBhcmF0b3JGb3VuZDtcbiAgICAgIGZ1bmN0aW9uIHNraXBXaGl0ZXNwYWNlKCkge1xuICAgICAgICB3aGlsZSAocG9zIDwgY29va2llc1N0cmluZy5sZW5ndGggJiYgL1xccy8udGVzdChjb29raWVzU3RyaW5nLmNoYXJBdChwb3MpKSkge1xuICAgICAgICAgIHBvcyArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwb3MgPCBjb29raWVzU3RyaW5nLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG5vdFNwZWNpYWxDaGFyKCkge1xuICAgICAgICBjaCA9IGNvb2tpZXNTdHJpbmcuY2hhckF0KHBvcyk7XG4gICAgICAgIHJldHVybiBjaCAhPT0gXCI9XCIgJiYgY2ggIT09IFwiO1wiICYmIGNoICE9PSBcIixcIjtcbiAgICAgIH1cbiAgICAgIHdoaWxlIChwb3MgPCBjb29raWVzU3RyaW5nLmxlbmd0aCkge1xuICAgICAgICBzdGFydCA9IHBvcztcbiAgICAgICAgY29va2llc1NlcGFyYXRvckZvdW5kID0gZmFsc2U7XG4gICAgICAgIHdoaWxlIChza2lwV2hpdGVzcGFjZSgpKSB7XG4gICAgICAgICAgY2ggPSBjb29raWVzU3RyaW5nLmNoYXJBdChwb3MpO1xuICAgICAgICAgIGlmIChjaCA9PT0gXCIsXCIpIHtcbiAgICAgICAgICAgIGxhc3RDb21tYSA9IHBvcztcbiAgICAgICAgICAgIHBvcyArPSAxO1xuICAgICAgICAgICAgc2tpcFdoaXRlc3BhY2UoKTtcbiAgICAgICAgICAgIG5leHRTdGFydCA9IHBvcztcbiAgICAgICAgICAgIHdoaWxlIChwb3MgPCBjb29raWVzU3RyaW5nLmxlbmd0aCAmJiBub3RTcGVjaWFsQ2hhcigpKSB7XG4gICAgICAgICAgICAgIHBvcyArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBvcyA8IGNvb2tpZXNTdHJpbmcubGVuZ3RoICYmIGNvb2tpZXNTdHJpbmcuY2hhckF0KHBvcykgPT09IFwiPVwiKSB7XG4gICAgICAgICAgICAgIGNvb2tpZXNTZXBhcmF0b3JGb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgIHBvcyA9IG5leHRTdGFydDtcbiAgICAgICAgICAgICAgY29va2llc1N0cmluZ3MucHVzaChjb29raWVzU3RyaW5nLnN1YnN0cmluZyhzdGFydCwgbGFzdENvbW1hKSk7XG4gICAgICAgICAgICAgIHN0YXJ0ID0gcG9zO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcG9zID0gbGFzdENvbW1hICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9zICs9IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghY29va2llc1NlcGFyYXRvckZvdW5kIHx8IHBvcyA+PSBjb29raWVzU3RyaW5nLmxlbmd0aCkge1xuICAgICAgICAgIGNvb2tpZXNTdHJpbmdzLnB1c2goY29va2llc1N0cmluZy5zdWJzdHJpbmcoc3RhcnQsIGNvb2tpZXNTdHJpbmcubGVuZ3RoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBjb29raWVzU3RyaW5ncztcbiAgICB9XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBwYXJzZTtcbiAgICBtb2R1bGUuZXhwb3J0cy5wYXJzZSA9IHBhcnNlO1xuICAgIG1vZHVsZS5leHBvcnRzLnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG4gICAgbW9kdWxlLmV4cG9ydHMuc3BsaXRDb29raWVzU3RyaW5nID0gc3BsaXRDb29raWVzU3RyaW5nMjtcbiAgfVxufSk7XG5cbi8vIHNyYy9IZWFkZXJzLnRzXG52YXIgaW1wb3J0X3NldF9jb29raWVfcGFyc2VyID0gX190b0VTTShyZXF1aXJlX3NldF9jb29raWUoKSk7XG5cbi8vIHNyYy91dGlscy9ub3JtYWxpemVIZWFkZXJOYW1lLnRzXG52YXIgSEVBREVSU19JTlZBTElEX0NIQVJBQ1RFUlMgPSAvW15hLXowLTlcXC0jJCUmJyorLl5fYHx+XS9pO1xuZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyTmFtZShuYW1lKSB7XG4gIGlmIChIRUFERVJTX0lOVkFMSURfQ0hBUkFDVEVSUy50ZXN0KG5hbWUpIHx8IG5hbWUudHJpbSgpID09PSBcIlwiKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBmaWVsZCBuYW1lXCIpO1xuICB9XG4gIHJldHVybiBuYW1lLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xufVxuXG4vLyBzcmMvdXRpbHMvbm9ybWFsaXplSGVhZGVyVmFsdWUudHNcbnZhciBjaGFyQ29kZXNUb1JlbW92ZSA9IFtcbiAgU3RyaW5nLmZyb21DaGFyQ29kZSgxMCksXG4gIFN0cmluZy5mcm9tQ2hhckNvZGUoMTMpLFxuICBTdHJpbmcuZnJvbUNoYXJDb2RlKDkpLFxuICBTdHJpbmcuZnJvbUNoYXJDb2RlKDMyKVxuXTtcbnZhciBIRUFERVJfVkFMVUVfUkVNT1ZFX1JFR0VYUCA9IG5ldyBSZWdFeHAoXG4gIGAoXlske2NoYXJDb2Rlc1RvUmVtb3ZlLmpvaW4oXCJcIil9XXwkWyR7Y2hhckNvZGVzVG9SZW1vdmUuam9pbihcIlwiKX1dKWAsXG4gIFwiZ1wiXG4pO1xuZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyVmFsdWUodmFsdWUpIHtcbiAgY29uc3QgbmV4dFZhbHVlID0gdmFsdWUucmVwbGFjZShIRUFERVJfVkFMVUVfUkVNT1ZFX1JFR0VYUCwgXCJcIik7XG4gIHJldHVybiBuZXh0VmFsdWU7XG59XG5cbi8vIHNyYy91dGlscy9pc1ZhbGlkSGVhZGVyTmFtZS50c1xuZnVuY3Rpb24gaXNWYWxpZEhlYWRlck5hbWUodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJzdHJpbmdcIikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjaGFyYWN0ZXIgPSB2YWx1ZS5jaGFyQ29kZUF0KGkpO1xuICAgIGlmIChjaGFyYWN0ZXIgPiAxMjcgfHwgIWlzVG9rZW4oY2hhcmFjdGVyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGlzVG9rZW4odmFsdWUpIHtcbiAgcmV0dXJuICFbXG4gICAgMTI3LFxuICAgIDMyLFxuICAgIFwiKFwiLFxuICAgIFwiKVwiLFxuICAgIFwiPFwiLFxuICAgIFwiPlwiLFxuICAgIFwiQFwiLFxuICAgIFwiLFwiLFxuICAgIFwiO1wiLFxuICAgIFwiOlwiLFxuICAgIFwiXFxcXFwiLFxuICAgICdcIicsXG4gICAgXCIvXCIsXG4gICAgXCJbXCIsXG4gICAgXCJdXCIsXG4gICAgXCI/XCIsXG4gICAgXCI9XCIsXG4gICAgXCJ7XCIsXG4gICAgXCJ9XCJcbiAgXS5pbmNsdWRlcyh2YWx1ZSk7XG59XG5cbi8vIHNyYy91dGlscy9pc1ZhbGlkSGVhZGVyVmFsdWUudHNcbmZ1bmN0aW9uIGlzVmFsaWRIZWFkZXJWYWx1ZSh2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcInN0cmluZ1wiKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh2YWx1ZS50cmltKCkgIT09IHZhbHVlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjaGFyYWN0ZXIgPSB2YWx1ZS5jaGFyQ29kZUF0KGkpO1xuICAgIGlmIChcbiAgICAgIC8vIE5VTC5cbiAgICAgIGNoYXJhY3RlciA9PT0gMCB8fCAvLyBIVFRQIG5ld2xpbmUgYnl0ZXMuXG4gICAgICBjaGFyYWN0ZXIgPT09IDEwIHx8IGNoYXJhY3RlciA9PT0gMTNcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIHNyYy9IZWFkZXJzLnRzXG52YXIgTk9STUFMSVpFRF9IRUFERVJTID0gU3ltYm9sKFwibm9ybWFsaXplZEhlYWRlcnNcIik7XG52YXIgUkFXX0hFQURFUl9OQU1FUyA9IFN5bWJvbChcInJhd0hlYWRlck5hbWVzXCIpO1xudmFyIEhFQURFUl9WQUxVRV9ERUxJTUlURVIgPSBcIiwgXCI7XG52YXIgX2EsIF9iLCBfYztcbnZhciBIZWFkZXJzID0gY2xhc3MgX0hlYWRlcnMge1xuICBjb25zdHJ1Y3Rvcihpbml0KSB7XG4gICAgLy8gTm9ybWFsaXplZCBoZWFkZXIge1wibmFtZVwiOlwiYSwgYlwifSBzdG9yYWdlLlxuICAgIHRoaXNbX2FdID0ge307XG4gICAgLy8gS2VlcHMgdGhlIG1hcHBpbmcgYmV0d2VlbiB0aGUgcmF3IGhlYWRlciBuYW1lXG4gICAgLy8gYW5kIHRoZSBub3JtYWxpemVkIGhlYWRlciBuYW1lIHRvIGVhc2UgdGhlIGxvb2t1cC5cbiAgICB0aGlzW19iXSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgdGhpc1tfY10gPSBcIkhlYWRlcnNcIjtcbiAgICBpZiAoW1wiSGVhZGVyc1wiLCBcIkhlYWRlcnNQb2x5ZmlsbFwiXS5pbmNsdWRlcyhpbml0Py5jb25zdHJ1Y3Rvci5uYW1lKSB8fCBpbml0IGluc3RhbmNlb2YgX0hlYWRlcnMgfHwgdHlwZW9mIGdsb2JhbFRoaXMuSGVhZGVycyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBpbml0IGluc3RhbmNlb2YgZ2xvYmFsVGhpcy5IZWFkZXJzKSB7XG4gICAgICBjb25zdCBpbml0aWFsSGVhZGVycyA9IGluaXQ7XG4gICAgICBpbml0aWFsSGVhZGVycy5mb3JFYWNoKCh2YWx1ZSwgbmFtZSkgPT4ge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCB2YWx1ZSk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoaW5pdCkpIHtcbiAgICAgIGluaXQuZm9yRWFjaCgoW25hbWUsIHZhbHVlXSkgPT4ge1xuICAgICAgICB0aGlzLmFwcGVuZChcbiAgICAgICAgICBuYW1lLFxuICAgICAgICAgIEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUuam9pbihIRUFERVJfVkFMVUVfREVMSU1JVEVSKSA6IHZhbHVlXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGluaXQpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGluaXQpLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBpbml0W25hbWVdO1xuICAgICAgICB0aGlzLmFwcGVuZChcbiAgICAgICAgICBuYW1lLFxuICAgICAgICAgIEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUuam9pbihIRUFERVJfVkFMVUVfREVMSU1JVEVSKSA6IHZhbHVlXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgWyhfYSA9IE5PUk1BTElaRURfSEVBREVSUywgX2IgPSBSQVdfSEVBREVSX05BTUVTLCBfYyA9IFN5bWJvbC50b1N0cmluZ1RhZywgU3ltYm9sLml0ZXJhdG9yKV0oKSB7XG4gICAgcmV0dXJuIHRoaXMuZW50cmllcygpO1xuICB9XG4gICprZXlzKCkge1xuICAgIGZvciAoY29uc3QgW25hbWVdIG9mIHRoaXMuZW50cmllcygpKSB7XG4gICAgICB5aWVsZCBuYW1lO1xuICAgIH1cbiAgfVxuICAqdmFsdWVzKCkge1xuICAgIGZvciAoY29uc3QgWywgdmFsdWVdIG9mIHRoaXMuZW50cmllcygpKSB7XG4gICAgICB5aWVsZCB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgKmVudHJpZXMoKSB7XG4gICAgbGV0IHNvcnRlZEtleXMgPSBPYmplY3Qua2V5cyh0aGlzW05PUk1BTElaRURfSEVBREVSU10pLnNvcnQoXG4gICAgICAoYSwgYikgPT4gYS5sb2NhbGVDb21wYXJlKGIpXG4gICAgKTtcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2Ygc29ydGVkS2V5cykge1xuICAgICAgaWYgKG5hbWUgPT09IFwic2V0LWNvb2tpZVwiKSB7XG4gICAgICAgIGZvciAoY29uc3QgdmFsdWUgb2YgdGhpcy5nZXRTZXRDb29raWUoKSkge1xuICAgICAgICAgIHlpZWxkIFtuYW1lLCB2YWx1ZV07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHlpZWxkIFtuYW1lLCB0aGlzLmdldChuYW1lKV07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYm9vbGVhbiBzdGF0aW5nIHdoZXRoZXIgYSBgSGVhZGVyc2Agb2JqZWN0IGNvbnRhaW5zIGEgY2VydGFpbiBoZWFkZXIuXG4gICAqL1xuICBoYXMobmFtZSkge1xuICAgIGlmICghaXNWYWxpZEhlYWRlck5hbWUobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEludmFsaWQgaGVhZGVyIG5hbWUgXCIke25hbWV9XCJgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNbTk9STUFMSVpFRF9IRUFERVJTXS5oYXNPd25Qcm9wZXJ0eShub3JtYWxpemVIZWFkZXJOYW1lKG5hbWUpKTtcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyBhIGBCeXRlU3RyaW5nYCBzZXF1ZW5jZSBvZiBhbGwgdGhlIHZhbHVlcyBvZiBhIGhlYWRlciB3aXRoIGEgZ2l2ZW4gbmFtZS5cbiAgICovXG4gIGdldChuYW1lKSB7XG4gICAgaWYgKCFpc1ZhbGlkSGVhZGVyTmFtZShuYW1lKSkge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKGBJbnZhbGlkIGhlYWRlciBuYW1lIFwiJHtuYW1lfVwiYCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzW05PUk1BTElaRURfSEVBREVSU11bbm9ybWFsaXplSGVhZGVyTmFtZShuYW1lKV0gPz8gbnVsbDtcbiAgfVxuICAvKipcbiAgICogU2V0cyBhIG5ldyB2YWx1ZSBmb3IgYW4gZXhpc3RpbmcgaGVhZGVyIGluc2lkZSBhIGBIZWFkZXJzYCBvYmplY3QsIG9yIGFkZHMgdGhlIGhlYWRlciBpZiBpdCBkb2VzIG5vdCBhbHJlYWR5IGV4aXN0LlxuICAgKi9cbiAgc2V0KG5hbWUsIHZhbHVlKSB7XG4gICAgaWYgKCFpc1ZhbGlkSGVhZGVyTmFtZShuYW1lKSB8fCAhaXNWYWxpZEhlYWRlclZhbHVlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBub3JtYWxpemVkTmFtZSA9IG5vcm1hbGl6ZUhlYWRlck5hbWUobmFtZSk7XG4gICAgY29uc3Qgbm9ybWFsaXplZFZhbHVlID0gbm9ybWFsaXplSGVhZGVyVmFsdWUodmFsdWUpO1xuICAgIHRoaXNbTk9STUFMSVpFRF9IRUFERVJTXVtub3JtYWxpemVkTmFtZV0gPSBub3JtYWxpemVIZWFkZXJWYWx1ZShub3JtYWxpemVkVmFsdWUpO1xuICAgIHRoaXNbUkFXX0hFQURFUl9OQU1FU10uc2V0KG5vcm1hbGl6ZWROYW1lLCBuYW1lKTtcbiAgfVxuICAvKipcbiAgICogQXBwZW5kcyBhIG5ldyB2YWx1ZSBvbnRvIGFuIGV4aXN0aW5nIGhlYWRlciBpbnNpZGUgYSBgSGVhZGVyc2Agb2JqZWN0LCBvciBhZGRzIHRoZSBoZWFkZXIgaWYgaXQgZG9lcyBub3QgYWxyZWFkeSBleGlzdC5cbiAgICovXG4gIGFwcGVuZChuYW1lLCB2YWx1ZSkge1xuICAgIGlmICghaXNWYWxpZEhlYWRlck5hbWUobmFtZSkgfHwgIWlzVmFsaWRIZWFkZXJWYWx1ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgbm9ybWFsaXplZE5hbWUgPSBub3JtYWxpemVIZWFkZXJOYW1lKG5hbWUpO1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRWYWx1ZSA9IG5vcm1hbGl6ZUhlYWRlclZhbHVlKHZhbHVlKTtcbiAgICBsZXQgcmVzb2x2ZWRWYWx1ZSA9IHRoaXMuaGFzKG5vcm1hbGl6ZWROYW1lKSA/IGAke3RoaXMuZ2V0KG5vcm1hbGl6ZWROYW1lKX0sICR7bm9ybWFsaXplZFZhbHVlfWAgOiBub3JtYWxpemVkVmFsdWU7XG4gICAgdGhpcy5zZXQobmFtZSwgcmVzb2x2ZWRWYWx1ZSk7XG4gIH1cbiAgLyoqXG4gICAqIERlbGV0ZXMgYSBoZWFkZXIgZnJvbSB0aGUgYEhlYWRlcnNgIG9iamVjdC5cbiAgICovXG4gIGRlbGV0ZShuYW1lKSB7XG4gICAgaWYgKCFpc1ZhbGlkSGVhZGVyTmFtZShuYW1lKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaGFzKG5hbWUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG5vcm1hbGl6ZWROYW1lID0gbm9ybWFsaXplSGVhZGVyTmFtZShuYW1lKTtcbiAgICBkZWxldGUgdGhpc1tOT1JNQUxJWkVEX0hFQURFUlNdW25vcm1hbGl6ZWROYW1lXTtcbiAgICB0aGlzW1JBV19IRUFERVJfTkFNRVNdLmRlbGV0ZShub3JtYWxpemVkTmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqIFRyYXZlcnNlcyB0aGUgYEhlYWRlcnNgIG9iamVjdCxcbiAgICogY2FsbGluZyB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGVhY2ggaGVhZGVyLlxuICAgKi9cbiAgZm9yRWFjaChjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiB0aGlzLmVudHJpZXMoKSkge1xuICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2YWx1ZSwgbmFtZSwgdGhpcyk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIHZhbHVlc1xuICAgKiBvZiBhbGwgU2V0LUNvb2tpZSBoZWFkZXJzIGFzc29jaWF0ZWRcbiAgICogd2l0aCBhIHJlc3BvbnNlXG4gICAqL1xuICBnZXRTZXRDb29raWUoKSB7XG4gICAgY29uc3Qgc2V0Q29va2llSGVhZGVyID0gdGhpcy5nZXQoXCJzZXQtY29va2llXCIpO1xuICAgIGlmIChzZXRDb29raWVIZWFkZXIgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgaWYgKHNldENvb2tpZUhlYWRlciA9PT0gXCJcIikge1xuICAgICAgcmV0dXJuIFtcIlwiXTtcbiAgICB9XG4gICAgcmV0dXJuICgwLCBpbXBvcnRfc2V0X2Nvb2tpZV9wYXJzZXIuc3BsaXRDb29raWVzU3RyaW5nKShzZXRDb29raWVIZWFkZXIpO1xuICB9XG59O1xuXG4vLyBzcmMvZ2V0UmF3SGVhZGVycy50c1xuZnVuY3Rpb24gZ2V0UmF3SGVhZGVycyhoZWFkZXJzKSB7XG4gIGNvbnN0IHJhd0hlYWRlcnMgPSB7fTtcbiAgZm9yIChjb25zdCBbbmFtZSwgdmFsdWVdIG9mIGhlYWRlcnMuZW50cmllcygpKSB7XG4gICAgcmF3SGVhZGVyc1toZWFkZXJzW1JBV19IRUFERVJfTkFNRVNdLmdldChuYW1lKV0gPSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gcmF3SGVhZGVycztcbn1cblxuLy8gc3JjL3RyYW5zZm9ybWVycy9oZWFkZXJzVG9MaXN0LnRzXG5mdW5jdGlvbiBoZWFkZXJzVG9MaXN0KGhlYWRlcnMpIHtcbiAgY29uc3QgaGVhZGVyc0xpc3QgPSBbXTtcbiAgaGVhZGVycy5mb3JFYWNoKCh2YWx1ZSwgbmFtZSkgPT4ge1xuICAgIGNvbnN0IHJlc29sdmVkVmFsdWUgPSB2YWx1ZS5pbmNsdWRlcyhcIixcIikgPyB2YWx1ZS5zcGxpdChcIixcIikubWFwKCh2YWx1ZTIpID0+IHZhbHVlMi50cmltKCkpIDogdmFsdWU7XG4gICAgaGVhZGVyc0xpc3QucHVzaChbbmFtZSwgcmVzb2x2ZWRWYWx1ZV0pO1xuICB9KTtcbiAgcmV0dXJuIGhlYWRlcnNMaXN0O1xufVxuXG4vLyBzcmMvdHJhbnNmb3JtZXJzL2hlYWRlcnNUb1N0cmluZy50c1xuZnVuY3Rpb24gaGVhZGVyc1RvU3RyaW5nKGhlYWRlcnMpIHtcbiAgY29uc3QgbGlzdCA9IGhlYWRlcnNUb0xpc3QoaGVhZGVycyk7XG4gIGNvbnN0IGxpbmVzID0gbGlzdC5tYXAoKFtuYW1lLCB2YWx1ZV0pID0+IHtcbiAgICBjb25zdCB2YWx1ZXMgPSBbXS5jb25jYXQodmFsdWUpO1xuICAgIHJldHVybiBgJHtuYW1lfTogJHt2YWx1ZXMuam9pbihcIiwgXCIpfWA7XG4gIH0pO1xuICByZXR1cm4gbGluZXMuam9pbihcIlxcclxcblwiKTtcbn1cblxuLy8gc3JjL3RyYW5zZm9ybWVycy9oZWFkZXJzVG9PYmplY3QudHNcbnZhciBzaW5nbGVWYWx1ZUhlYWRlcnMgPSBbXCJ1c2VyLWFnZW50XCJdO1xuZnVuY3Rpb24gaGVhZGVyc1RvT2JqZWN0KGhlYWRlcnMpIHtcbiAgY29uc3QgaGVhZGVyc09iamVjdCA9IHt9O1xuICBoZWFkZXJzLmZvckVhY2goKHZhbHVlLCBuYW1lKSA9PiB7XG4gICAgY29uc3QgaXNNdWx0aVZhbHVlID0gIXNpbmdsZVZhbHVlSGVhZGVycy5pbmNsdWRlcyhuYW1lLnRvTG93ZXJDYXNlKCkpICYmIHZhbHVlLmluY2x1ZGVzKFwiLFwiKTtcbiAgICBoZWFkZXJzT2JqZWN0W25hbWVdID0gaXNNdWx0aVZhbHVlID8gdmFsdWUuc3BsaXQoXCIsXCIpLm1hcCgocykgPT4gcy50cmltKCkpIDogdmFsdWU7XG4gIH0pO1xuICByZXR1cm4gaGVhZGVyc09iamVjdDtcbn1cblxuLy8gc3JjL3RyYW5zZm9ybWVycy9zdHJpbmdUb0hlYWRlcnMudHNcbmZ1bmN0aW9uIHN0cmluZ1RvSGVhZGVycyhzdHIpIHtcbiAgY29uc3QgbGluZXMgPSBzdHIudHJpbSgpLnNwbGl0KC9bXFxyXFxuXSsvKTtcbiAgcmV0dXJuIGxpbmVzLnJlZHVjZSgoaGVhZGVycywgbGluZSkgPT4ge1xuICAgIGlmIChsaW5lLnRyaW0oKSA9PT0gXCJcIikge1xuICAgICAgcmV0dXJuIGhlYWRlcnM7XG4gICAgfVxuICAgIGNvbnN0IHBhcnRzID0gbGluZS5zcGxpdChcIjogXCIpO1xuICAgIGNvbnN0IG5hbWUgPSBwYXJ0cy5zaGlmdCgpO1xuICAgIGNvbnN0IHZhbHVlID0gcGFydHMuam9pbihcIjogXCIpO1xuICAgIGhlYWRlcnMuYXBwZW5kKG5hbWUsIHZhbHVlKTtcbiAgICByZXR1cm4gaGVhZGVycztcbiAgfSwgbmV3IEhlYWRlcnMoKSk7XG59XG5cbi8vIHNyYy90cmFuc2Zvcm1lcnMvbGlzdFRvSGVhZGVycy50c1xuZnVuY3Rpb24gbGlzdFRvSGVhZGVycyhsaXN0KSB7XG4gIGNvbnN0IGhlYWRlcnMgPSBuZXcgSGVhZGVycygpO1xuICBsaXN0LmZvckVhY2goKFtuYW1lLCB2YWx1ZV0pID0+IHtcbiAgICBjb25zdCB2YWx1ZXMgPSBbXS5jb25jYXQodmFsdWUpO1xuICAgIHZhbHVlcy5mb3JFYWNoKCh2YWx1ZTIpID0+IHtcbiAgICAgIGhlYWRlcnMuYXBwZW5kKG5hbWUsIHZhbHVlMik7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gaGVhZGVycztcbn1cblxuLy8gc3JjL3RyYW5zZm9ybWVycy9yZWR1Y2VIZWFkZXJzT2JqZWN0LnRzXG5mdW5jdGlvbiByZWR1Y2VIZWFkZXJzT2JqZWN0KGhlYWRlcnMsIHJlZHVjZXIsIGluaXRpYWxTdGF0ZSkge1xuICByZXR1cm4gT2JqZWN0LmtleXMoaGVhZGVycykucmVkdWNlKChuZXh0SGVhZGVycywgbmFtZSkgPT4ge1xuICAgIHJldHVybiByZWR1Y2VyKG5leHRIZWFkZXJzLCBuYW1lLCBoZWFkZXJzW25hbWVdKTtcbiAgfSwgaW5pdGlhbFN0YXRlKTtcbn1cblxuLy8gc3JjL3RyYW5zZm9ybWVycy9vYmplY3RUb0hlYWRlcnMudHNcbmZ1bmN0aW9uIG9iamVjdFRvSGVhZGVycyhoZWFkZXJzT2JqZWN0KSB7XG4gIHJldHVybiByZWR1Y2VIZWFkZXJzT2JqZWN0KFxuICAgIGhlYWRlcnNPYmplY3QsXG4gICAgKGhlYWRlcnMsIG5hbWUsIHZhbHVlKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZXMgPSBbXS5jb25jYXQodmFsdWUpLmZpbHRlcihCb29sZWFuKTtcbiAgICAgIHZhbHVlcy5mb3JFYWNoKCh2YWx1ZTIpID0+IHtcbiAgICAgICAgaGVhZGVycy5hcHBlbmQobmFtZSwgdmFsdWUyKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGhlYWRlcnM7XG4gICAgfSxcbiAgICBuZXcgSGVhZGVycygpXG4gICk7XG59XG5cbi8vIHNyYy90cmFuc2Zvcm1lcnMvZmxhdHRlbkhlYWRlcnNMaXN0LnRzXG5mdW5jdGlvbiBmbGF0dGVuSGVhZGVyc0xpc3QobGlzdCkge1xuICByZXR1cm4gbGlzdC5tYXAoKFtuYW1lLCB2YWx1ZXNdKSA9PiB7XG4gICAgcmV0dXJuIFtuYW1lLCBbXS5jb25jYXQodmFsdWVzKS5qb2luKFwiLCBcIildO1xuICB9KTtcbn1cblxuLy8gc3JjL3RyYW5zZm9ybWVycy9mbGF0dGVuSGVhZGVyc09iamVjdC50c1xuZnVuY3Rpb24gZmxhdHRlbkhlYWRlcnNPYmplY3QoaGVhZGVyc09iamVjdCkge1xuICByZXR1cm4gcmVkdWNlSGVhZGVyc09iamVjdChcbiAgICBoZWFkZXJzT2JqZWN0LFxuICAgIChoZWFkZXJzLCBuYW1lLCB2YWx1ZSkgPT4ge1xuICAgICAgaGVhZGVyc1tuYW1lXSA9IFtdLmNvbmNhdCh2YWx1ZSkuam9pbihcIiwgXCIpO1xuICAgICAgcmV0dXJuIGhlYWRlcnM7XG4gICAgfSxcbiAgICB7fVxuICApO1xufVxuZXhwb3J0IHtcbiAgSGVhZGVycyxcbiAgZmxhdHRlbkhlYWRlcnNMaXN0LFxuICBmbGF0dGVuSGVhZGVyc09iamVjdCxcbiAgZ2V0UmF3SGVhZGVycyxcbiAgaGVhZGVyc1RvTGlzdCxcbiAgaGVhZGVyc1RvT2JqZWN0LFxuICBoZWFkZXJzVG9TdHJpbmcsXG4gIGxpc3RUb0hlYWRlcnMsXG4gIG9iamVjdFRvSGVhZGVycyxcbiAgcmVkdWNlSGVhZGVyc09iamVjdCxcbiAgc3RyaW5nVG9IZWFkZXJzXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcCIsImltcG9ydCB7IGVudl9nZXQgfSBmcm9tICdzcGFjZXRpbWU6c3lzQDIuMic7XG5pbXBvcnQgKiBhcyBfc3lzY2FsbHMyXzAgZnJvbSAnc3BhY2V0aW1lOnN5c0AyLjAnO1xuaW1wb3J0IHsgbW9kdWxlSG9va3MgfSBmcm9tICdzcGFjZXRpbWU6c3lzQDIuMCc7XG5pbXBvcnQgeyBIZWFkZXJzIH0gZnJvbSAnaGVhZGVycy1wb2x5ZmlsbCc7XG5leHBvcnQgeyBIZWFkZXJzIH0gZnJvbSAnaGVhZGVycy1wb2x5ZmlsbCc7XG5pbXBvcnQgKiBhcyBfc3lzY2FsbHMyXzEgZnJvbSAnc3BhY2V0aW1lOnN5c0AyLjEnO1xuXG50eXBlb2YgZ2xvYmFsVGhpcyE9PVwidW5kZWZpbmVkXCImJigoZ2xvYmFsVGhpcy5nbG9iYWw9Z2xvYmFsVGhpcy5nbG9iYWx8fGdsb2JhbFRoaXMpLChnbG9iYWxUaGlzLndpbmRvdz1nbG9iYWxUaGlzLndpbmRvd3x8Z2xvYmFsVGhpcykpO1xudmFyIF9fY3JlYXRlID0gT2JqZWN0LmNyZWF0ZTtcbnZhciBfX2RlZlByb3AgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XG52YXIgX19nZXRPd25Qcm9wRGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG52YXIgX19nZXRPd25Qcm9wTmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcztcbnZhciBfX2dldFByb3RvT2YgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG52YXIgX19oYXNPd25Qcm9wID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciBfX2VzbSA9IChmbiwgcmVzKSA9PiBmdW5jdGlvbiBfX2luaXQoKSB7XG4gIHJldHVybiBmbiAmJiAocmVzID0gKDAsIGZuW19fZ2V0T3duUHJvcE5hbWVzKGZuKVswXV0pKGZuID0gMCkpLCByZXM7XG59O1xudmFyIF9fY29tbW9uSlMgPSAoY2IsIG1vZCkgPT4gZnVuY3Rpb24gX19yZXF1aXJlKCkge1xuICByZXR1cm4gbW9kIHx8ICgwLCBjYltfX2dldE93blByb3BOYW1lcyhjYilbMF1dKSgobW9kID0geyBleHBvcnRzOiB7fSB9KS5leHBvcnRzLCBtb2QpLCBtb2QuZXhwb3J0cztcbn07XG52YXIgX19leHBvcnQgPSAodGFyZ2V0LCBhbGwpID0+IHtcbiAgZm9yICh2YXIgbmFtZSBpbiBhbGwpXG4gICAgX19kZWZQcm9wKHRhcmdldCwgbmFtZSwgeyBnZXQ6IGFsbFtuYW1lXSwgZW51bWVyYWJsZTogdHJ1ZSB9KTtcbn07XG52YXIgX19jb3B5UHJvcHMgPSAodG8sIGZyb20sIGV4Y2VwdCwgZGVzYykgPT4ge1xuICBpZiAoZnJvbSAmJiB0eXBlb2YgZnJvbSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgZnJvbSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgZm9yIChsZXQga2V5IG9mIF9fZ2V0T3duUHJvcE5hbWVzKGZyb20pKVxuICAgICAgaWYgKCFfX2hhc093blByb3AuY2FsbCh0bywga2V5KSAmJiBrZXkgIT09IGV4Y2VwdClcbiAgICAgICAgX19kZWZQcm9wKHRvLCBrZXksIHsgZ2V0OiAoKSA9PiBmcm9tW2tleV0sIGVudW1lcmFibGU6ICEoZGVzYyA9IF9fZ2V0T3duUHJvcERlc2MoZnJvbSwga2V5KSkgfHwgZGVzYy5lbnVtZXJhYmxlIH0pO1xuICB9XG4gIHJldHVybiB0bztcbn07XG52YXIgX190b0VTTSA9IChtb2QsIGlzTm9kZU1vZGUsIHRhcmdldCkgPT4gKHRhcmdldCA9IG1vZCAhPSBudWxsID8gX19jcmVhdGUoX19nZXRQcm90b09mKG1vZCkpIDoge30sIF9fY29weVByb3BzKFxuICAvLyBJZiB0aGUgaW1wb3J0ZXIgaXMgaW4gbm9kZSBjb21wYXRpYmlsaXR5IG1vZGUgb3IgdGhpcyBpcyBub3QgYW4gRVNNXG4gIC8vIGZpbGUgdGhhdCBoYXMgYmVlbiBjb252ZXJ0ZWQgdG8gYSBDb21tb25KUyBmaWxlIHVzaW5nIGEgQmFiZWwtXG4gIC8vIGNvbXBhdGlibGUgdHJhbnNmb3JtIChpLmUuIFwiX19lc01vZHVsZVwiIGhhcyBub3QgYmVlbiBzZXQpLCB0aGVuIHNldFxuICAvLyBcImRlZmF1bHRcIiB0byB0aGUgQ29tbW9uSlMgXCJtb2R1bGUuZXhwb3J0c1wiIGZvciBub2RlIGNvbXBhdGliaWxpdHkuXG4gIF9fZGVmUHJvcCh0YXJnZXQsIFwiZGVmYXVsdFwiLCB7IHZhbHVlOiBtb2QsIGVudW1lcmFibGU6IHRydWUgfSkgLFxuICBtb2RcbikpO1xudmFyIF9fdG9Db21tb25KUyA9IChtb2QpID0+IF9fY29weVByb3BzKF9fZGVmUHJvcCh7fSwgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSksIG1vZCk7XG5cbi8vIC4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9iYXNlNjQtanNAMS41LjEvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9pbmRleC5qc1xudmFyIHJlcXVpcmVfYmFzZTY0X2pzID0gX19jb21tb25KUyh7XG4gIFwiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2Jhc2U2NC1qc0AxLjUuMS9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzXCIoZXhwb3J0cykge1xuICAgIGV4cG9ydHMuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGg7XG4gICAgZXhwb3J0cy50b0J5dGVBcnJheSA9IHRvQnl0ZUFycmF5O1xuICAgIGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IGZyb21CeXRlQXJyYXkyO1xuICAgIHZhciBsb29rdXAgPSBbXTtcbiAgICB2YXIgcmV2TG9va3VwID0gW107XG4gICAgdmFyIEFyciA9IHR5cGVvZiBVaW50OEFycmF5ICE9PSBcInVuZGVmaW5lZFwiID8gVWludDhBcnJheSA6IEFycmF5O1xuICAgIHZhciBjb2RlID0gXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvXCI7XG4gICAgZm9yIChpID0gMCwgbGVuID0gY29kZS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgbG9va3VwW2ldID0gY29kZVtpXTtcbiAgICAgIHJldkxvb2t1cFtjb2RlLmNoYXJDb2RlQXQoaSldID0gaTtcbiAgICB9XG4gICAgdmFyIGk7XG4gICAgdmFyIGxlbjtcbiAgICByZXZMb29rdXBbXCItXCIuY2hhckNvZGVBdCgwKV0gPSA2MjtcbiAgICByZXZMb29rdXBbXCJfXCIuY2hhckNvZGVBdCgwKV0gPSA2MztcbiAgICBmdW5jdGlvbiBnZXRMZW5zKGI2NCkge1xuICAgICAgdmFyIGxlbjIgPSBiNjQubGVuZ3RoO1xuICAgICAgaWYgKGxlbjIgJSA0ID4gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0XCIpO1xuICAgICAgfVxuICAgICAgdmFyIHZhbGlkTGVuID0gYjY0LmluZGV4T2YoXCI9XCIpO1xuICAgICAgaWYgKHZhbGlkTGVuID09PSAtMSkgdmFsaWRMZW4gPSBsZW4yO1xuICAgICAgdmFyIHBsYWNlSG9sZGVyc0xlbiA9IHZhbGlkTGVuID09PSBsZW4yID8gMCA6IDQgLSB2YWxpZExlbiAlIDQ7XG4gICAgICByZXR1cm4gW3ZhbGlkTGVuLCBwbGFjZUhvbGRlcnNMZW5dO1xuICAgIH1cbiAgICBmdW5jdGlvbiBieXRlTGVuZ3RoKGI2NCkge1xuICAgICAgdmFyIGxlbnMgPSBnZXRMZW5zKGI2NCk7XG4gICAgICB2YXIgdmFsaWRMZW4gPSBsZW5zWzBdO1xuICAgICAgdmFyIHBsYWNlSG9sZGVyc0xlbiA9IGxlbnNbMV07XG4gICAgICByZXR1cm4gKHZhbGlkTGVuICsgcGxhY2VIb2xkZXJzTGVuKSAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzTGVuO1xuICAgIH1cbiAgICBmdW5jdGlvbiBfYnl0ZUxlbmd0aChiNjQsIHZhbGlkTGVuLCBwbGFjZUhvbGRlcnNMZW4pIHtcbiAgICAgIHJldHVybiAodmFsaWRMZW4gKyBwbGFjZUhvbGRlcnNMZW4pICogMyAvIDQgLSBwbGFjZUhvbGRlcnNMZW47XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRvQnl0ZUFycmF5KGI2NCkge1xuICAgICAgdmFyIHRtcDtcbiAgICAgIHZhciBsZW5zID0gZ2V0TGVucyhiNjQpO1xuICAgICAgdmFyIHZhbGlkTGVuID0gbGVuc1swXTtcbiAgICAgIHZhciBwbGFjZUhvbGRlcnNMZW4gPSBsZW5zWzFdO1xuICAgICAgdmFyIGFyciA9IG5ldyBBcnIoX2J5dGVMZW5ndGgoYjY0LCB2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuKSk7XG4gICAgICB2YXIgY3VyQnl0ZSA9IDA7XG4gICAgICB2YXIgbGVuMiA9IHBsYWNlSG9sZGVyc0xlbiA+IDAgPyB2YWxpZExlbiAtIDQgOiB2YWxpZExlbjtcbiAgICAgIHZhciBpMjtcbiAgICAgIGZvciAoaTIgPSAwOyBpMiA8IGxlbjI7IGkyICs9IDQpIHtcbiAgICAgICAgdG1wID0gcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkyKV0gPDwgMTggfCByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIgKyAxKV0gPDwgMTIgfCByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIgKyAyKV0gPDwgNiB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMiArIDMpXTtcbiAgICAgICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgPj4gMTYgJiAyNTU7XG4gICAgICAgIGFycltjdXJCeXRlKytdID0gdG1wID4+IDggJiAyNTU7XG4gICAgICAgIGFycltjdXJCeXRlKytdID0gdG1wICYgMjU1O1xuICAgICAgfVxuICAgICAgaWYgKHBsYWNlSG9sZGVyc0xlbiA9PT0gMikge1xuICAgICAgICB0bXAgPSByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIpXSA8PCAyIHwgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkyICsgMSldID4+IDQ7XG4gICAgICAgIGFycltjdXJCeXRlKytdID0gdG1wICYgMjU1O1xuICAgICAgfVxuICAgICAgaWYgKHBsYWNlSG9sZGVyc0xlbiA9PT0gMSkge1xuICAgICAgICB0bXAgPSByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIpXSA8PCAxMCB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMiArIDEpXSA8PCA0IHwgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkyICsgMildID4+IDI7XG4gICAgICAgIGFycltjdXJCeXRlKytdID0gdG1wID4+IDggJiAyNTU7XG4gICAgICAgIGFycltjdXJCeXRlKytdID0gdG1wICYgMjU1O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFycjtcbiAgICB9XG4gICAgZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0KG51bSkge1xuICAgICAgcmV0dXJuIGxvb2t1cFtudW0gPj4gMTggJiA2M10gKyBsb29rdXBbbnVtID4+IDEyICYgNjNdICsgbG9va3VwW251bSA+PiA2ICYgNjNdICsgbG9va3VwW251bSAmIDYzXTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZW5jb2RlQ2h1bmsodWludDgsIHN0YXJ0LCBlbmQpIHtcbiAgICAgIHZhciB0bXA7XG4gICAgICB2YXIgb3V0cHV0ID0gW107XG4gICAgICBmb3IgKHZhciBpMiA9IHN0YXJ0OyBpMiA8IGVuZDsgaTIgKz0gMykge1xuICAgICAgICB0bXAgPSAodWludDhbaTJdIDw8IDE2ICYgMTY3MTE2ODApICsgKHVpbnQ4W2kyICsgMV0gPDwgOCAmIDY1MjgwKSArICh1aW50OFtpMiArIDJdICYgMjU1KTtcbiAgICAgICAgb3V0cHV0LnB1c2godHJpcGxldFRvQmFzZTY0KHRtcCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG91dHB1dC5qb2luKFwiXCIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBmcm9tQnl0ZUFycmF5Mih1aW50OCkge1xuICAgICAgdmFyIHRtcDtcbiAgICAgIHZhciBsZW4yID0gdWludDgubGVuZ3RoO1xuICAgICAgdmFyIGV4dHJhQnl0ZXMgPSBsZW4yICUgMztcbiAgICAgIHZhciBwYXJ0cyA9IFtdO1xuICAgICAgdmFyIG1heENodW5rTGVuZ3RoID0gMTYzODM7XG4gICAgICBmb3IgKHZhciBpMiA9IDAsIGxlbjIyID0gbGVuMiAtIGV4dHJhQnl0ZXM7IGkyIDwgbGVuMjI7IGkyICs9IG1heENodW5rTGVuZ3RoKSB7XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlQ2h1bmsodWludDgsIGkyLCBpMiArIG1heENodW5rTGVuZ3RoID4gbGVuMjIgPyBsZW4yMiA6IGkyICsgbWF4Q2h1bmtMZW5ndGgpKTtcbiAgICAgIH1cbiAgICAgIGlmIChleHRyYUJ5dGVzID09PSAxKSB7XG4gICAgICAgIHRtcCA9IHVpbnQ4W2xlbjIgLSAxXTtcbiAgICAgICAgcGFydHMucHVzaChcbiAgICAgICAgICBsb29rdXBbdG1wID4+IDJdICsgbG9va3VwW3RtcCA8PCA0ICYgNjNdICsgXCI9PVwiXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKGV4dHJhQnl0ZXMgPT09IDIpIHtcbiAgICAgICAgdG1wID0gKHVpbnQ4W2xlbjIgLSAyXSA8PCA4KSArIHVpbnQ4W2xlbjIgLSAxXTtcbiAgICAgICAgcGFydHMucHVzaChcbiAgICAgICAgICBsb29rdXBbdG1wID4+IDEwXSArIGxvb2t1cFt0bXAgPj4gNCAmIDYzXSArIGxvb2t1cFt0bXAgPDwgMiAmIDYzXSArIFwiPVwiXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcGFydHMuam9pbihcIlwiKTtcbiAgICB9XG4gIH1cbn0pO1xuXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vc3RhdHVzZXNAMi4wLjIvbm9kZV9tb2R1bGVzL3N0YXR1c2VzL2NvZGVzLmpzb25cbnZhciByZXF1aXJlX2NvZGVzID0gX19jb21tb25KUyh7XG4gIFwiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3N0YXR1c2VzQDIuMC4yL25vZGVfbW9kdWxlcy9zdGF0dXNlcy9jb2Rlcy5qc29uXCIoZXhwb3J0cywgbW9kdWxlKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgICBcIjEwMFwiOiBcIkNvbnRpbnVlXCIsXG4gICAgICBcIjEwMVwiOiBcIlN3aXRjaGluZyBQcm90b2NvbHNcIixcbiAgICAgIFwiMTAyXCI6IFwiUHJvY2Vzc2luZ1wiLFxuICAgICAgXCIxMDNcIjogXCJFYXJseSBIaW50c1wiLFxuICAgICAgXCIyMDBcIjogXCJPS1wiLFxuICAgICAgXCIyMDFcIjogXCJDcmVhdGVkXCIsXG4gICAgICBcIjIwMlwiOiBcIkFjY2VwdGVkXCIsXG4gICAgICBcIjIwM1wiOiBcIk5vbi1BdXRob3JpdGF0aXZlIEluZm9ybWF0aW9uXCIsXG4gICAgICBcIjIwNFwiOiBcIk5vIENvbnRlbnRcIixcbiAgICAgIFwiMjA1XCI6IFwiUmVzZXQgQ29udGVudFwiLFxuICAgICAgXCIyMDZcIjogXCJQYXJ0aWFsIENvbnRlbnRcIixcbiAgICAgIFwiMjA3XCI6IFwiTXVsdGktU3RhdHVzXCIsXG4gICAgICBcIjIwOFwiOiBcIkFscmVhZHkgUmVwb3J0ZWRcIixcbiAgICAgIFwiMjI2XCI6IFwiSU0gVXNlZFwiLFxuICAgICAgXCIzMDBcIjogXCJNdWx0aXBsZSBDaG9pY2VzXCIsXG4gICAgICBcIjMwMVwiOiBcIk1vdmVkIFBlcm1hbmVudGx5XCIsXG4gICAgICBcIjMwMlwiOiBcIkZvdW5kXCIsXG4gICAgICBcIjMwM1wiOiBcIlNlZSBPdGhlclwiLFxuICAgICAgXCIzMDRcIjogXCJOb3QgTW9kaWZpZWRcIixcbiAgICAgIFwiMzA1XCI6IFwiVXNlIFByb3h5XCIsXG4gICAgICBcIjMwN1wiOiBcIlRlbXBvcmFyeSBSZWRpcmVjdFwiLFxuICAgICAgXCIzMDhcIjogXCJQZXJtYW5lbnQgUmVkaXJlY3RcIixcbiAgICAgIFwiNDAwXCI6IFwiQmFkIFJlcXVlc3RcIixcbiAgICAgIFwiNDAxXCI6IFwiVW5hdXRob3JpemVkXCIsXG4gICAgICBcIjQwMlwiOiBcIlBheW1lbnQgUmVxdWlyZWRcIixcbiAgICAgIFwiNDAzXCI6IFwiRm9yYmlkZGVuXCIsXG4gICAgICBcIjQwNFwiOiBcIk5vdCBGb3VuZFwiLFxuICAgICAgXCI0MDVcIjogXCJNZXRob2QgTm90IEFsbG93ZWRcIixcbiAgICAgIFwiNDA2XCI6IFwiTm90IEFjY2VwdGFibGVcIixcbiAgICAgIFwiNDA3XCI6IFwiUHJveHkgQXV0aGVudGljYXRpb24gUmVxdWlyZWRcIixcbiAgICAgIFwiNDA4XCI6IFwiUmVxdWVzdCBUaW1lb3V0XCIsXG4gICAgICBcIjQwOVwiOiBcIkNvbmZsaWN0XCIsXG4gICAgICBcIjQxMFwiOiBcIkdvbmVcIixcbiAgICAgIFwiNDExXCI6IFwiTGVuZ3RoIFJlcXVpcmVkXCIsXG4gICAgICBcIjQxMlwiOiBcIlByZWNvbmRpdGlvbiBGYWlsZWRcIixcbiAgICAgIFwiNDEzXCI6IFwiUGF5bG9hZCBUb28gTGFyZ2VcIixcbiAgICAgIFwiNDE0XCI6IFwiVVJJIFRvbyBMb25nXCIsXG4gICAgICBcIjQxNVwiOiBcIlVuc3VwcG9ydGVkIE1lZGlhIFR5cGVcIixcbiAgICAgIFwiNDE2XCI6IFwiUmFuZ2UgTm90IFNhdGlzZmlhYmxlXCIsXG4gICAgICBcIjQxN1wiOiBcIkV4cGVjdGF0aW9uIEZhaWxlZFwiLFxuICAgICAgXCI0MThcIjogXCJJJ20gYSBUZWFwb3RcIixcbiAgICAgIFwiNDIxXCI6IFwiTWlzZGlyZWN0ZWQgUmVxdWVzdFwiLFxuICAgICAgXCI0MjJcIjogXCJVbnByb2Nlc3NhYmxlIEVudGl0eVwiLFxuICAgICAgXCI0MjNcIjogXCJMb2NrZWRcIixcbiAgICAgIFwiNDI0XCI6IFwiRmFpbGVkIERlcGVuZGVuY3lcIixcbiAgICAgIFwiNDI1XCI6IFwiVG9vIEVhcmx5XCIsXG4gICAgICBcIjQyNlwiOiBcIlVwZ3JhZGUgUmVxdWlyZWRcIixcbiAgICAgIFwiNDI4XCI6IFwiUHJlY29uZGl0aW9uIFJlcXVpcmVkXCIsXG4gICAgICBcIjQyOVwiOiBcIlRvbyBNYW55IFJlcXVlc3RzXCIsXG4gICAgICBcIjQzMVwiOiBcIlJlcXVlc3QgSGVhZGVyIEZpZWxkcyBUb28gTGFyZ2VcIixcbiAgICAgIFwiNDUxXCI6IFwiVW5hdmFpbGFibGUgRm9yIExlZ2FsIFJlYXNvbnNcIixcbiAgICAgIFwiNTAwXCI6IFwiSW50ZXJuYWwgU2VydmVyIEVycm9yXCIsXG4gICAgICBcIjUwMVwiOiBcIk5vdCBJbXBsZW1lbnRlZFwiLFxuICAgICAgXCI1MDJcIjogXCJCYWQgR2F0ZXdheVwiLFxuICAgICAgXCI1MDNcIjogXCJTZXJ2aWNlIFVuYXZhaWxhYmxlXCIsXG4gICAgICBcIjUwNFwiOiBcIkdhdGV3YXkgVGltZW91dFwiLFxuICAgICAgXCI1MDVcIjogXCJIVFRQIFZlcnNpb24gTm90IFN1cHBvcnRlZFwiLFxuICAgICAgXCI1MDZcIjogXCJWYXJpYW50IEFsc28gTmVnb3RpYXRlc1wiLFxuICAgICAgXCI1MDdcIjogXCJJbnN1ZmZpY2llbnQgU3RvcmFnZVwiLFxuICAgICAgXCI1MDhcIjogXCJMb29wIERldGVjdGVkXCIsXG4gICAgICBcIjUwOVwiOiBcIkJhbmR3aWR0aCBMaW1pdCBFeGNlZWRlZFwiLFxuICAgICAgXCI1MTBcIjogXCJOb3QgRXh0ZW5kZWRcIixcbiAgICAgIFwiNTExXCI6IFwiTmV0d29yayBBdXRoZW50aWNhdGlvbiBSZXF1aXJlZFwiXG4gICAgfTtcbiAgfVxufSk7XG5cbi8vIC4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9zdGF0dXNlc0AyLjAuMi9ub2RlX21vZHVsZXMvc3RhdHVzZXMvaW5kZXguanNcbnZhciByZXF1aXJlX3N0YXR1c2VzID0gX19jb21tb25KUyh7XG4gIFwiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3N0YXR1c2VzQDIuMC4yL25vZGVfbW9kdWxlcy9zdGF0dXNlcy9pbmRleC5qc1wiKGV4cG9ydHMsIG1vZHVsZSkge1xuICAgIHZhciBjb2RlcyA9IHJlcXVpcmVfY29kZXMoKTtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHN0YXR1czI7XG4gICAgc3RhdHVzMi5tZXNzYWdlID0gY29kZXM7XG4gICAgc3RhdHVzMi5jb2RlID0gY3JlYXRlTWVzc2FnZVRvU3RhdHVzQ29kZU1hcChjb2Rlcyk7XG4gICAgc3RhdHVzMi5jb2RlcyA9IGNyZWF0ZVN0YXR1c0NvZGVMaXN0KGNvZGVzKTtcbiAgICBzdGF0dXMyLnJlZGlyZWN0ID0ge1xuICAgICAgMzAwOiB0cnVlLFxuICAgICAgMzAxOiB0cnVlLFxuICAgICAgMzAyOiB0cnVlLFxuICAgICAgMzAzOiB0cnVlLFxuICAgICAgMzA1OiB0cnVlLFxuICAgICAgMzA3OiB0cnVlLFxuICAgICAgMzA4OiB0cnVlXG4gICAgfTtcbiAgICBzdGF0dXMyLmVtcHR5ID0ge1xuICAgICAgMjA0OiB0cnVlLFxuICAgICAgMjA1OiB0cnVlLFxuICAgICAgMzA0OiB0cnVlXG4gICAgfTtcbiAgICBzdGF0dXMyLnJldHJ5ID0ge1xuICAgICAgNTAyOiB0cnVlLFxuICAgICAgNTAzOiB0cnVlLFxuICAgICAgNTA0OiB0cnVlXG4gICAgfTtcbiAgICBmdW5jdGlvbiBjcmVhdGVNZXNzYWdlVG9TdGF0dXNDb2RlTWFwKGNvZGVzMikge1xuICAgICAgdmFyIG1hcCA9IHt9O1xuICAgICAgT2JqZWN0LmtleXMoY29kZXMyKS5mb3JFYWNoKGZ1bmN0aW9uIGZvckVhY2hDb2RlKGNvZGUpIHtcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBjb2RlczJbY29kZV07XG4gICAgICAgIHZhciBzdGF0dXMzID0gTnVtYmVyKGNvZGUpO1xuICAgICAgICBtYXBbbWVzc2FnZS50b0xvd2VyQ2FzZSgpXSA9IHN0YXR1czM7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBtYXA7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZVN0YXR1c0NvZGVMaXN0KGNvZGVzMikge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGNvZGVzMikubWFwKGZ1bmN0aW9uIG1hcENvZGUoY29kZSkge1xuICAgICAgICByZXR1cm4gTnVtYmVyKGNvZGUpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldFN0YXR1c0NvZGUobWVzc2FnZSkge1xuICAgICAgdmFyIG1zZyA9IG1lc3NhZ2UudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHN0YXR1czIuY29kZSwgbXNnKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgc3RhdHVzIG1lc3NhZ2U6IFwiJyArIG1lc3NhZ2UgKyAnXCInKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdGF0dXMyLmNvZGVbbXNnXTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ2V0U3RhdHVzTWVzc2FnZShjb2RlKSB7XG4gICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzdGF0dXMyLm1lc3NhZ2UsIGNvZGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgc3RhdHVzIGNvZGU6IFwiICsgY29kZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RhdHVzMi5tZXNzYWdlW2NvZGVdO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzdGF0dXMyKGNvZGUpIHtcbiAgICAgIGlmICh0eXBlb2YgY29kZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICByZXR1cm4gZ2V0U3RhdHVzTWVzc2FnZShjb2RlKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgY29kZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiY29kZSBtdXN0IGJlIGEgbnVtYmVyIG9yIHN0cmluZ1wiKTtcbiAgICAgIH1cbiAgICAgIHZhciBuID0gcGFyc2VJbnQoY29kZSwgMTApO1xuICAgICAgaWYgKCFpc05hTihuKSkge1xuICAgICAgICByZXR1cm4gZ2V0U3RhdHVzTWVzc2FnZShuKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBnZXRTdGF0dXNDb2RlKGNvZGUpO1xuICAgIH1cbiAgfVxufSk7XG5cbi8vIHNyYy91dGlsLXN0dWIudHNcbnZhciB1dGlsX3N0dWJfZXhwb3J0cyA9IHt9O1xuX19leHBvcnQodXRpbF9zdHViX2V4cG9ydHMsIHtcbiAgaW5zcGVjdDogKCkgPT4gaW5zcGVjdFxufSk7XG52YXIgaW5zcGVjdDtcbnZhciBpbml0X3V0aWxfc3R1YiA9IF9fZXNtKHtcbiAgXCJzcmMvdXRpbC1zdHViLnRzXCIoKSB7XG4gICAgaW5zcGVjdCA9IHt9O1xuICB9XG59KTtcblxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL29iamVjdC1pbnNwZWN0QDEuMTMuNC9ub2RlX21vZHVsZXMvb2JqZWN0LWluc3BlY3QvdXRpbC5pbnNwZWN0LmpzXG52YXIgcmVxdWlyZV91dGlsX2luc3BlY3QgPSBfX2NvbW1vbkpTKHtcbiAgXCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vb2JqZWN0LWluc3BlY3RAMS4xMy40L25vZGVfbW9kdWxlcy9vYmplY3QtaW5zcGVjdC91dGlsLmluc3BlY3QuanNcIihleHBvcnRzLCBtb2R1bGUpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IChpbml0X3V0aWxfc3R1YigpLCBfX3RvQ29tbW9uSlModXRpbF9zdHViX2V4cG9ydHMpKS5pbnNwZWN0O1xuICB9XG59KTtcblxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL29iamVjdC1pbnNwZWN0QDEuMTMuNC9ub2RlX21vZHVsZXMvb2JqZWN0LWluc3BlY3QvaW5kZXguanNcbnZhciByZXF1aXJlX29iamVjdF9pbnNwZWN0ID0gX19jb21tb25KUyh7XG4gIFwiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL29iamVjdC1pbnNwZWN0QDEuMTMuNC9ub2RlX21vZHVsZXMvb2JqZWN0LWluc3BlY3QvaW5kZXguanNcIihleHBvcnRzLCBtb2R1bGUpIHtcbiAgICB2YXIgaGFzTWFwID0gdHlwZW9mIE1hcCA9PT0gXCJmdW5jdGlvblwiICYmIE1hcC5wcm90b3R5cGU7XG4gICAgdmFyIG1hcFNpemVEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvciAmJiBoYXNNYXAgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE1hcC5wcm90b3R5cGUsIFwic2l6ZVwiKSA6IG51bGw7XG4gICAgdmFyIG1hcFNpemUgPSBoYXNNYXAgJiYgbWFwU2l6ZURlc2NyaXB0b3IgJiYgdHlwZW9mIG1hcFNpemVEZXNjcmlwdG9yLmdldCA9PT0gXCJmdW5jdGlvblwiID8gbWFwU2l6ZURlc2NyaXB0b3IuZ2V0IDogbnVsbDtcbiAgICB2YXIgbWFwRm9yRWFjaCA9IGhhc01hcCAmJiBNYXAucHJvdG90eXBlLmZvckVhY2g7XG4gICAgdmFyIGhhc1NldCA9IHR5cGVvZiBTZXQgPT09IFwiZnVuY3Rpb25cIiAmJiBTZXQucHJvdG90eXBlO1xuICAgIHZhciBzZXRTaXplRGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgJiYgaGFzU2V0ID8gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihTZXQucHJvdG90eXBlLCBcInNpemVcIikgOiBudWxsO1xuICAgIHZhciBzZXRTaXplID0gaGFzU2V0ICYmIHNldFNpemVEZXNjcmlwdG9yICYmIHR5cGVvZiBzZXRTaXplRGVzY3JpcHRvci5nZXQgPT09IFwiZnVuY3Rpb25cIiA/IHNldFNpemVEZXNjcmlwdG9yLmdldCA6IG51bGw7XG4gICAgdmFyIHNldEZvckVhY2ggPSBoYXNTZXQgJiYgU2V0LnByb3RvdHlwZS5mb3JFYWNoO1xuICAgIHZhciBoYXNXZWFrTWFwID0gdHlwZW9mIFdlYWtNYXAgPT09IFwiZnVuY3Rpb25cIiAmJiBXZWFrTWFwLnByb3RvdHlwZTtcbiAgICB2YXIgd2Vha01hcEhhcyA9IGhhc1dlYWtNYXAgPyBXZWFrTWFwLnByb3RvdHlwZS5oYXMgOiBudWxsO1xuICAgIHZhciBoYXNXZWFrU2V0ID0gdHlwZW9mIFdlYWtTZXQgPT09IFwiZnVuY3Rpb25cIiAmJiBXZWFrU2V0LnByb3RvdHlwZTtcbiAgICB2YXIgd2Vha1NldEhhcyA9IGhhc1dlYWtTZXQgPyBXZWFrU2V0LnByb3RvdHlwZS5oYXMgOiBudWxsO1xuICAgIHZhciBoYXNXZWFrUmVmID0gdHlwZW9mIFdlYWtSZWYgPT09IFwiZnVuY3Rpb25cIiAmJiBXZWFrUmVmLnByb3RvdHlwZTtcbiAgICB2YXIgd2Vha1JlZkRlcmVmID0gaGFzV2Vha1JlZiA/IFdlYWtSZWYucHJvdG90eXBlLmRlcmVmIDogbnVsbDtcbiAgICB2YXIgYm9vbGVhblZhbHVlT2YgPSBCb29sZWFuLnByb3RvdHlwZS52YWx1ZU9mO1xuICAgIHZhciBvYmplY3RUb1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG4gICAgdmFyIGZ1bmN0aW9uVG9TdHJpbmcgPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmc7XG4gICAgdmFyICRtYXRjaCA9IFN0cmluZy5wcm90b3R5cGUubWF0Y2g7XG4gICAgdmFyICRzbGljZSA9IFN0cmluZy5wcm90b3R5cGUuc2xpY2U7XG4gICAgdmFyICRyZXBsYWNlID0gU3RyaW5nLnByb3RvdHlwZS5yZXBsYWNlO1xuICAgIHZhciAkdG9VcHBlckNhc2UgPSBTdHJpbmcucHJvdG90eXBlLnRvVXBwZXJDYXNlO1xuICAgIHZhciAkdG9Mb3dlckNhc2UgPSBTdHJpbmcucHJvdG90eXBlLnRvTG93ZXJDYXNlO1xuICAgIHZhciAkdGVzdCA9IFJlZ0V4cC5wcm90b3R5cGUudGVzdDtcbiAgICB2YXIgJGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG4gICAgdmFyICRqb2luID0gQXJyYXkucHJvdG90eXBlLmpvaW47XG4gICAgdmFyICRhcnJTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbiAgICB2YXIgJGZsb29yID0gTWF0aC5mbG9vcjtcbiAgICB2YXIgYmlnSW50VmFsdWVPZiA9IHR5cGVvZiBCaWdJbnQgPT09IFwiZnVuY3Rpb25cIiA/IEJpZ0ludC5wcm90b3R5cGUudmFsdWVPZiA6IG51bGw7XG4gICAgdmFyIGdPUFMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuICAgIHZhciBzeW1Ub1N0cmluZyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gU3ltYm9sLnByb3RvdHlwZS50b1N0cmluZyA6IG51bGw7XG4gICAgdmFyIGhhc1NoYW1tZWRTeW1ib2xzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwib2JqZWN0XCI7XG4gICAgdmFyIHRvU3RyaW5nVGFnID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC50b1N0cmluZ1RhZyAmJiAodHlwZW9mIFN5bWJvbC50b1N0cmluZ1RhZyA9PT0gaGFzU2hhbW1lZFN5bWJvbHMgPyBcIm9iamVjdFwiIDogXCJzeW1ib2xcIikgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiBudWxsO1xuICAgIHZhciBpc0VudW1lcmFibGUgPSBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuICAgIHZhciBnUE8gPSAodHlwZW9mIFJlZmxlY3QgPT09IFwiZnVuY3Rpb25cIiA/IFJlZmxlY3QuZ2V0UHJvdG90eXBlT2YgOiBPYmplY3QuZ2V0UHJvdG90eXBlT2YpIHx8IChbXS5fX3Byb3RvX18gPT09IEFycmF5LnByb3RvdHlwZSA/IGZ1bmN0aW9uKE8pIHtcbiAgICAgIHJldHVybiBPLl9fcHJvdG9fXztcbiAgICB9IDogbnVsbCk7XG4gICAgZnVuY3Rpb24gYWRkTnVtZXJpY1NlcGFyYXRvcihudW0sIHN0cikge1xuICAgICAgaWYgKG51bSA9PT0gSW5maW5pdHkgfHwgbnVtID09PSAtSW5maW5pdHkgfHwgbnVtICE9PSBudW0gfHwgbnVtICYmIG51bSA+IC0xZTMgJiYgbnVtIDwgMWUzIHx8ICR0ZXN0LmNhbGwoL2UvLCBzdHIpKSB7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgICB9XG4gICAgICB2YXIgc2VwUmVnZXggPSAvWzAtOV0oPz0oPzpbMC05XXszfSkrKD8hWzAtOV0pKS9nO1xuICAgICAgaWYgKHR5cGVvZiBudW0gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgdmFyIGludCA9IG51bSA8IDAgPyAtJGZsb29yKC1udW0pIDogJGZsb29yKG51bSk7XG4gICAgICAgIGlmIChpbnQgIT09IG51bSkge1xuICAgICAgICAgIHZhciBpbnRTdHIgPSBTdHJpbmcoaW50KTtcbiAgICAgICAgICB2YXIgZGVjID0gJHNsaWNlLmNhbGwoc3RyLCBpbnRTdHIubGVuZ3RoICsgMSk7XG4gICAgICAgICAgcmV0dXJuICRyZXBsYWNlLmNhbGwoaW50U3RyLCBzZXBSZWdleCwgXCIkJl9cIikgKyBcIi5cIiArICRyZXBsYWNlLmNhbGwoJHJlcGxhY2UuY2FsbChkZWMsIC8oWzAtOV17M30pL2csIFwiJCZfXCIpLCAvXyQvLCBcIlwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuICRyZXBsYWNlLmNhbGwoc3RyLCBzZXBSZWdleCwgXCIkJl9cIik7XG4gICAgfVxuICAgIHZhciB1dGlsSW5zcGVjdCA9IHJlcXVpcmVfdXRpbF9pbnNwZWN0KCk7XG4gICAgdmFyIGluc3BlY3RDdXN0b20gPSB1dGlsSW5zcGVjdC5jdXN0b207XG4gICAgdmFyIGluc3BlY3RTeW1ib2wgPSBpc1N5bWJvbChpbnNwZWN0Q3VzdG9tKSA/IGluc3BlY3RDdXN0b20gOiBudWxsO1xuICAgIHZhciBxdW90ZXMgPSB7XG4gICAgICBfX3Byb3RvX186IG51bGwsXG4gICAgICBcImRvdWJsZVwiOiAnXCInLFxuICAgICAgc2luZ2xlOiBcIidcIlxuICAgIH07XG4gICAgdmFyIHF1b3RlUkVzID0ge1xuICAgICAgX19wcm90b19fOiBudWxsLFxuICAgICAgXCJkb3VibGVcIjogLyhbXCJcXFxcXSkvZyxcbiAgICAgIHNpbmdsZTogLyhbJ1xcXFxdKS9nXG4gICAgfTtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluc3BlY3RfKG9iaiwgb3B0aW9ucywgZGVwdGgsIHNlZW4pIHtcbiAgICAgIHZhciBvcHRzID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIGlmIChoYXMob3B0cywgXCJxdW90ZVN0eWxlXCIpICYmICFoYXMocXVvdGVzLCBvcHRzLnF1b3RlU3R5bGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiBcInF1b3RlU3R5bGVcIiBtdXN0IGJlIFwic2luZ2xlXCIgb3IgXCJkb3VibGVcIicpO1xuICAgICAgfVxuICAgICAgaWYgKGhhcyhvcHRzLCBcIm1heFN0cmluZ0xlbmd0aFwiKSAmJiAodHlwZW9mIG9wdHMubWF4U3RyaW5nTGVuZ3RoID09PSBcIm51bWJlclwiID8gb3B0cy5tYXhTdHJpbmdMZW5ndGggPCAwICYmIG9wdHMubWF4U3RyaW5nTGVuZ3RoICE9PSBJbmZpbml0eSA6IG9wdHMubWF4U3RyaW5nTGVuZ3RoICE9PSBudWxsKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gXCJtYXhTdHJpbmdMZW5ndGhcIiwgaWYgcHJvdmlkZWQsIG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyLCBJbmZpbml0eSwgb3IgYG51bGxgJyk7XG4gICAgICB9XG4gICAgICB2YXIgY3VzdG9tSW5zcGVjdCA9IGhhcyhvcHRzLCBcImN1c3RvbUluc3BlY3RcIikgPyBvcHRzLmN1c3RvbUluc3BlY3QgOiB0cnVlO1xuICAgICAgaWYgKHR5cGVvZiBjdXN0b21JbnNwZWN0ICE9PSBcImJvb2xlYW5cIiAmJiBjdXN0b21JbnNwZWN0ICE9PSBcInN5bWJvbFwiKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJvcHRpb24gXFxcImN1c3RvbUluc3BlY3RcXFwiLCBpZiBwcm92aWRlZCwgbXVzdCBiZSBgdHJ1ZWAsIGBmYWxzZWAsIG9yIGAnc3ltYm9sJ2BcIik7XG4gICAgICB9XG4gICAgICBpZiAoaGFzKG9wdHMsIFwiaW5kZW50XCIpICYmIG9wdHMuaW5kZW50ICE9PSBudWxsICYmIG9wdHMuaW5kZW50ICE9PSBcIlx0XCIgJiYgIShwYXJzZUludChvcHRzLmluZGVudCwgMTApID09PSBvcHRzLmluZGVudCAmJiBvcHRzLmluZGVudCA+IDApKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiBcImluZGVudFwiIG11c3QgYmUgXCJcXFxcdFwiLCBhbiBpbnRlZ2VyID4gMCwgb3IgYG51bGxgJyk7XG4gICAgICB9XG4gICAgICBpZiAoaGFzKG9wdHMsIFwibnVtZXJpY1NlcGFyYXRvclwiKSAmJiB0eXBlb2Ygb3B0cy5udW1lcmljU2VwYXJhdG9yICE9PSBcImJvb2xlYW5cIikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gXCJudW1lcmljU2VwYXJhdG9yXCIsIGlmIHByb3ZpZGVkLCBtdXN0IGJlIGB0cnVlYCBvciBgZmFsc2VgJyk7XG4gICAgICB9XG4gICAgICB2YXIgbnVtZXJpY1NlcGFyYXRvciA9IG9wdHMubnVtZXJpY1NlcGFyYXRvcjtcbiAgICAgIGlmICh0eXBlb2Ygb2JqID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHJldHVybiBcInVuZGVmaW5lZFwiO1xuICAgICAgfVxuICAgICAgaWYgKG9iaiA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gXCJudWxsXCI7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgcmV0dXJuIG9iaiA/IFwidHJ1ZVwiIDogXCJmYWxzZVwiO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcmV0dXJuIGluc3BlY3RTdHJpbmcob2JqLCBvcHRzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2Ygb2JqID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIGlmIChvYmogPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gSW5maW5pdHkgLyBvYmogPiAwID8gXCIwXCIgOiBcIi0wXCI7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHN0ciA9IFN0cmluZyhvYmopO1xuICAgICAgICByZXR1cm4gbnVtZXJpY1NlcGFyYXRvciA/IGFkZE51bWVyaWNTZXBhcmF0b3Iob2JqLCBzdHIpIDogc3RyO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwiYmlnaW50XCIpIHtcbiAgICAgICAgdmFyIGJpZ0ludFN0ciA9IFN0cmluZyhvYmopICsgXCJuXCI7XG4gICAgICAgIHJldHVybiBudW1lcmljU2VwYXJhdG9yID8gYWRkTnVtZXJpY1NlcGFyYXRvcihvYmosIGJpZ0ludFN0cikgOiBiaWdJbnRTdHI7XG4gICAgICB9XG4gICAgICB2YXIgbWF4RGVwdGggPSB0eXBlb2Ygb3B0cy5kZXB0aCA9PT0gXCJ1bmRlZmluZWRcIiA/IDUgOiBvcHRzLmRlcHRoO1xuICAgICAgaWYgKHR5cGVvZiBkZXB0aCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBkZXB0aCA9IDA7XG4gICAgICB9XG4gICAgICBpZiAoZGVwdGggPj0gbWF4RGVwdGggJiYgbWF4RGVwdGggPiAwICYmIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIGlzQXJyYXkob2JqKSA/IFwiW0FycmF5XVwiIDogXCJbT2JqZWN0XVwiO1xuICAgICAgfVxuICAgICAgdmFyIGluZGVudCA9IGdldEluZGVudChvcHRzLCBkZXB0aCk7XG4gICAgICBpZiAodHlwZW9mIHNlZW4gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgc2VlbiA9IFtdO1xuICAgICAgfSBlbHNlIGlmIChpbmRleE9mKHNlZW4sIG9iaikgPj0gMCkge1xuICAgICAgICByZXR1cm4gXCJbQ2lyY3VsYXJdXCI7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBpbnNwZWN0Myh2YWx1ZSwgZnJvbSwgbm9JbmRlbnQpIHtcbiAgICAgICAgaWYgKGZyb20pIHtcbiAgICAgICAgICBzZWVuID0gJGFyclNsaWNlLmNhbGwoc2Vlbik7XG4gICAgICAgICAgc2Vlbi5wdXNoKGZyb20pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub0luZGVudCkge1xuICAgICAgICAgIHZhciBuZXdPcHRzID0ge1xuICAgICAgICAgICAgZGVwdGg6IG9wdHMuZGVwdGhcbiAgICAgICAgICB9O1xuICAgICAgICAgIGlmIChoYXMob3B0cywgXCJxdW90ZVN0eWxlXCIpKSB7XG4gICAgICAgICAgICBuZXdPcHRzLnF1b3RlU3R5bGUgPSBvcHRzLnF1b3RlU3R5bGU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBpbnNwZWN0Xyh2YWx1ZSwgbmV3T3B0cywgZGVwdGggKyAxLCBzZWVuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zcGVjdF8odmFsdWUsIG9wdHMsIGRlcHRoICsgMSwgc2Vlbik7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJmdW5jdGlvblwiICYmICFpc1JlZ0V4cChvYmopKSB7XG4gICAgICAgIHZhciBuYW1lID0gbmFtZU9mKG9iaik7XG4gICAgICAgIHZhciBrZXlzID0gYXJyT2JqS2V5cyhvYmosIGluc3BlY3QzKTtcbiAgICAgICAgcmV0dXJuIFwiW0Z1bmN0aW9uXCIgKyAobmFtZSA/IFwiOiBcIiArIG5hbWUgOiBcIiAoYW5vbnltb3VzKVwiKSArIFwiXVwiICsgKGtleXMubGVuZ3RoID4gMCA/IFwiIHsgXCIgKyAkam9pbi5jYWxsKGtleXMsIFwiLCBcIikgKyBcIiB9XCIgOiBcIlwiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1N5bWJvbChvYmopKSB7XG4gICAgICAgIHZhciBzeW1TdHJpbmcgPSBoYXNTaGFtbWVkU3ltYm9scyA/ICRyZXBsYWNlLmNhbGwoU3RyaW5nKG9iaiksIC9eKFN5bWJvbFxcKC4qXFwpKV9bXildKiQvLCBcIiQxXCIpIDogc3ltVG9TdHJpbmcuY2FsbChvYmopO1xuICAgICAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiAhaGFzU2hhbW1lZFN5bWJvbHMgPyBtYXJrQm94ZWQoc3ltU3RyaW5nKSA6IHN5bVN0cmluZztcbiAgICAgIH1cbiAgICAgIGlmIChpc0VsZW1lbnQob2JqKSkge1xuICAgICAgICB2YXIgcyA9IFwiPFwiICsgJHRvTG93ZXJDYXNlLmNhbGwoU3RyaW5nKG9iai5ub2RlTmFtZSkpO1xuICAgICAgICB2YXIgYXR0cnMgPSBvYmouYXR0cmlidXRlcyB8fCBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhdHRycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHMgKz0gXCIgXCIgKyBhdHRyc1tpXS5uYW1lICsgXCI9XCIgKyB3cmFwUXVvdGVzKHF1b3RlKGF0dHJzW2ldLnZhbHVlKSwgXCJkb3VibGVcIiwgb3B0cyk7XG4gICAgICAgIH1cbiAgICAgICAgcyArPSBcIj5cIjtcbiAgICAgICAgaWYgKG9iai5jaGlsZE5vZGVzICYmIG9iai5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgIHMgKz0gXCIuLi5cIjtcbiAgICAgICAgfVxuICAgICAgICBzICs9IFwiPC9cIiArICR0b0xvd2VyQ2FzZS5jYWxsKFN0cmluZyhvYmoubm9kZU5hbWUpKSArIFwiPlwiO1xuICAgICAgICByZXR1cm4gcztcbiAgICAgIH1cbiAgICAgIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAgICAgaWYgKG9iai5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gXCJbXVwiO1xuICAgICAgICB9XG4gICAgICAgIHZhciB4cyA9IGFyck9iaktleXMob2JqLCBpbnNwZWN0Myk7XG4gICAgICAgIGlmIChpbmRlbnQgJiYgIXNpbmdsZUxpbmVWYWx1ZXMoeHMpKSB7XG4gICAgICAgICAgcmV0dXJuIFwiW1wiICsgaW5kZW50ZWRKb2luKHhzLCBpbmRlbnQpICsgXCJdXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFwiWyBcIiArICRqb2luLmNhbGwoeHMsIFwiLCBcIikgKyBcIiBdXCI7XG4gICAgICB9XG4gICAgICBpZiAoaXNFcnJvcihvYmopKSB7XG4gICAgICAgIHZhciBwYXJ0cyA9IGFyck9iaktleXMob2JqLCBpbnNwZWN0Myk7XG4gICAgICAgIGlmICghKFwiY2F1c2VcIiBpbiBFcnJvci5wcm90b3R5cGUpICYmIFwiY2F1c2VcIiBpbiBvYmogJiYgIWlzRW51bWVyYWJsZS5jYWxsKG9iaiwgXCJjYXVzZVwiKSkge1xuICAgICAgICAgIHJldHVybiBcInsgW1wiICsgU3RyaW5nKG9iaikgKyBcIl0gXCIgKyAkam9pbi5jYWxsKCRjb25jYXQuY2FsbChcIltjYXVzZV06IFwiICsgaW5zcGVjdDMob2JqLmNhdXNlKSwgcGFydHMpLCBcIiwgXCIpICsgXCIgfVwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gXCJbXCIgKyBTdHJpbmcob2JqKSArIFwiXVwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBcInsgW1wiICsgU3RyaW5nKG9iaikgKyBcIl0gXCIgKyAkam9pbi5jYWxsKHBhcnRzLCBcIiwgXCIpICsgXCIgfVwiO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgJiYgY3VzdG9tSW5zcGVjdCkge1xuICAgICAgICBpZiAoaW5zcGVjdFN5bWJvbCAmJiB0eXBlb2Ygb2JqW2luc3BlY3RTeW1ib2xdID09PSBcImZ1bmN0aW9uXCIgJiYgdXRpbEluc3BlY3QpIHtcbiAgICAgICAgICByZXR1cm4gdXRpbEluc3BlY3Qob2JqLCB7IGRlcHRoOiBtYXhEZXB0aCAtIGRlcHRoIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGN1c3RvbUluc3BlY3QgIT09IFwic3ltYm9sXCIgJiYgdHlwZW9mIG9iai5pbnNwZWN0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICByZXR1cm4gb2JqLmluc3BlY3QoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGlzTWFwKG9iaikpIHtcbiAgICAgICAgdmFyIG1hcFBhcnRzID0gW107XG4gICAgICAgIGlmIChtYXBGb3JFYWNoKSB7XG4gICAgICAgICAgbWFwRm9yRWFjaC5jYWxsKG9iaiwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICAgICAgbWFwUGFydHMucHVzaChpbnNwZWN0MyhrZXksIG9iaiwgdHJ1ZSkgKyBcIiA9PiBcIiArIGluc3BlY3QzKHZhbHVlLCBvYmopKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29sbGVjdGlvbk9mKFwiTWFwXCIsIG1hcFNpemUuY2FsbChvYmopLCBtYXBQYXJ0cywgaW5kZW50KTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1NldChvYmopKSB7XG4gICAgICAgIHZhciBzZXRQYXJ0cyA9IFtdO1xuICAgICAgICBpZiAoc2V0Rm9yRWFjaCkge1xuICAgICAgICAgIHNldEZvckVhY2guY2FsbChvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBzZXRQYXJ0cy5wdXNoKGluc3BlY3QzKHZhbHVlLCBvYmopKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29sbGVjdGlvbk9mKFwiU2V0XCIsIHNldFNpemUuY2FsbChvYmopLCBzZXRQYXJ0cywgaW5kZW50KTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1dlYWtNYXAob2JqKSkge1xuICAgICAgICByZXR1cm4gd2Vha0NvbGxlY3Rpb25PZihcIldlYWtNYXBcIik7XG4gICAgICB9XG4gICAgICBpZiAoaXNXZWFrU2V0KG9iaikpIHtcbiAgICAgICAgcmV0dXJuIHdlYWtDb2xsZWN0aW9uT2YoXCJXZWFrU2V0XCIpO1xuICAgICAgfVxuICAgICAgaWYgKGlzV2Vha1JlZihvYmopKSB7XG4gICAgICAgIHJldHVybiB3ZWFrQ29sbGVjdGlvbk9mKFwiV2Vha1JlZlwiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc051bWJlcihvYmopKSB7XG4gICAgICAgIHJldHVybiBtYXJrQm94ZWQoaW5zcGVjdDMoTnVtYmVyKG9iaikpKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc0JpZ0ludChvYmopKSB7XG4gICAgICAgIHJldHVybiBtYXJrQm94ZWQoaW5zcGVjdDMoYmlnSW50VmFsdWVPZi5jYWxsKG9iaikpKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc0Jvb2xlYW4ob2JqKSkge1xuICAgICAgICByZXR1cm4gbWFya0JveGVkKGJvb2xlYW5WYWx1ZU9mLmNhbGwob2JqKSk7XG4gICAgICB9XG4gICAgICBpZiAoaXNTdHJpbmcob2JqKSkge1xuICAgICAgICByZXR1cm4gbWFya0JveGVkKGluc3BlY3QzKFN0cmluZyhvYmopKSk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBvYmogPT09IHdpbmRvdykge1xuICAgICAgICByZXR1cm4gXCJ7IFtvYmplY3QgV2luZG93XSB9XCI7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGdsb2JhbFRoaXMgIT09IFwidW5kZWZpbmVkXCIgJiYgb2JqID09PSBnbG9iYWxUaGlzIHx8IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgJiYgb2JqID09PSBnbG9iYWwpIHtcbiAgICAgICAgcmV0dXJuIFwieyBbb2JqZWN0IGdsb2JhbFRoaXNdIH1cIjtcbiAgICAgIH1cbiAgICAgIGlmICghaXNEYXRlKG9iaikgJiYgIWlzUmVnRXhwKG9iaikpIHtcbiAgICAgICAgdmFyIHlzID0gYXJyT2JqS2V5cyhvYmosIGluc3BlY3QzKTtcbiAgICAgICAgdmFyIGlzUGxhaW5PYmplY3QgPSBnUE8gPyBnUE8ob2JqKSA9PT0gT2JqZWN0LnByb3RvdHlwZSA6IG9iaiBpbnN0YW5jZW9mIE9iamVjdCB8fCBvYmouY29uc3RydWN0b3IgPT09IE9iamVjdDtcbiAgICAgICAgdmFyIHByb3RvVGFnID0gb2JqIGluc3RhbmNlb2YgT2JqZWN0ID8gXCJcIiA6IFwibnVsbCBwcm90b3R5cGVcIjtcbiAgICAgICAgdmFyIHN0cmluZ1RhZyA9ICFpc1BsYWluT2JqZWN0ICYmIHRvU3RyaW5nVGFnICYmIE9iamVjdChvYmopID09PSBvYmogJiYgdG9TdHJpbmdUYWcgaW4gb2JqID8gJHNsaWNlLmNhbGwodG9TdHIob2JqKSwgOCwgLTEpIDogcHJvdG9UYWcgPyBcIk9iamVjdFwiIDogXCJcIjtcbiAgICAgICAgdmFyIGNvbnN0cnVjdG9yVGFnID0gaXNQbGFpbk9iamVjdCB8fCB0eXBlb2Ygb2JqLmNvbnN0cnVjdG9yICE9PSBcImZ1bmN0aW9uXCIgPyBcIlwiIDogb2JqLmNvbnN0cnVjdG9yLm5hbWUgPyBvYmouY29uc3RydWN0b3IubmFtZSArIFwiIFwiIDogXCJcIjtcbiAgICAgICAgdmFyIHRhZyA9IGNvbnN0cnVjdG9yVGFnICsgKHN0cmluZ1RhZyB8fCBwcm90b1RhZyA/IFwiW1wiICsgJGpvaW4uY2FsbCgkY29uY2F0LmNhbGwoW10sIHN0cmluZ1RhZyB8fCBbXSwgcHJvdG9UYWcgfHwgW10pLCBcIjogXCIpICsgXCJdIFwiIDogXCJcIik7XG4gICAgICAgIGlmICh5cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gdGFnICsgXCJ7fVwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbmRlbnQpIHtcbiAgICAgICAgICByZXR1cm4gdGFnICsgXCJ7XCIgKyBpbmRlbnRlZEpvaW4oeXMsIGluZGVudCkgKyBcIn1cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGFnICsgXCJ7IFwiICsgJGpvaW4uY2FsbCh5cywgXCIsIFwiKSArIFwiIH1cIjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBTdHJpbmcob2JqKTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIHdyYXBRdW90ZXMocywgZGVmYXVsdFN0eWxlLCBvcHRzKSB7XG4gICAgICB2YXIgc3R5bGUgPSBvcHRzLnF1b3RlU3R5bGUgfHwgZGVmYXVsdFN0eWxlO1xuICAgICAgdmFyIHF1b3RlQ2hhciA9IHF1b3Rlc1tzdHlsZV07XG4gICAgICByZXR1cm4gcXVvdGVDaGFyICsgcyArIHF1b3RlQ2hhcjtcbiAgICB9XG4gICAgZnVuY3Rpb24gcXVvdGUocykge1xuICAgICAgcmV0dXJuICRyZXBsYWNlLmNhbGwoU3RyaW5nKHMpLCAvXCIvZywgXCImcXVvdDtcIik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNhblRydXN0VG9TdHJpbmcob2JqKSB7XG4gICAgICByZXR1cm4gIXRvU3RyaW5nVGFnIHx8ICEodHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiAodG9TdHJpbmdUYWcgaW4gb2JqIHx8IHR5cGVvZiBvYmpbdG9TdHJpbmdUYWddICE9PSBcInVuZGVmaW5lZFwiKSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzQXJyYXkob2JqKSB7XG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiICYmIGNhblRydXN0VG9TdHJpbmcob2JqKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNEYXRlKG9iaikge1xuICAgICAgcmV0dXJuIHRvU3RyKG9iaikgPT09IFwiW29iamVjdCBEYXRlXVwiICYmIGNhblRydXN0VG9TdHJpbmcob2JqKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNSZWdFeHAob2JqKSB7XG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IFJlZ0V4cF1cIiAmJiBjYW5UcnVzdFRvU3RyaW5nKG9iaik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzRXJyb3Iob2JqKSB7XG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IEVycm9yXVwiICYmIGNhblRydXN0VG9TdHJpbmcob2JqKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNTdHJpbmcob2JqKSB7XG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IFN0cmluZ11cIiAmJiBjYW5UcnVzdFRvU3RyaW5nKG9iaik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzTnVtYmVyKG9iaikge1xuICAgICAgcmV0dXJuIHRvU3RyKG9iaikgPT09IFwiW29iamVjdCBOdW1iZXJdXCIgJiYgY2FuVHJ1c3RUb1N0cmluZyhvYmopO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc0Jvb2xlYW4ob2JqKSB7XG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IEJvb2xlYW5dXCIgJiYgY2FuVHJ1c3RUb1N0cmluZyhvYmopO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc1N5bWJvbChvYmopIHtcbiAgICAgIGlmIChoYXNTaGFtbWVkU3ltYm9scykge1xuICAgICAgICByZXR1cm4gb2JqICYmIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgJiYgb2JqIGluc3RhbmNlb2YgU3ltYm9sO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwic3ltYm9sXCIpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBpZiAoIW9iaiB8fCB0eXBlb2Ygb2JqICE9PSBcIm9iamVjdFwiIHx8ICFzeW1Ub1N0cmluZykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBzeW1Ub1N0cmluZy5jYWxsKG9iaik7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc0JpZ0ludChvYmopIHtcbiAgICAgIGlmICghb2JqIHx8IHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIgfHwgIWJpZ0ludFZhbHVlT2YpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgYmlnSW50VmFsdWVPZi5jYWxsKG9iaik7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgaGFzT3duMiA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkgfHwgZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4ga2V5IGluIHRoaXM7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBoYXMob2JqLCBrZXkpIHtcbiAgICAgIHJldHVybiBoYXNPd24yLmNhbGwob2JqLCBrZXkpO1xuICAgIH1cbiAgICBmdW5jdGlvbiB0b1N0cihvYmopIHtcbiAgICAgIHJldHVybiBvYmplY3RUb1N0cmluZy5jYWxsKG9iaik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG5hbWVPZihmKSB7XG4gICAgICBpZiAoZi5uYW1lKSB7XG4gICAgICAgIHJldHVybiBmLm5hbWU7XG4gICAgICB9XG4gICAgICB2YXIgbSA9ICRtYXRjaC5jYWxsKGZ1bmN0aW9uVG9TdHJpbmcuY2FsbChmKSwgL15mdW5jdGlvblxccyooW1xcdyRdKykvKTtcbiAgICAgIGlmIChtKSB7XG4gICAgICAgIHJldHVybiBtWzFdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGluZGV4T2YoeHMsIHgpIHtcbiAgICAgIGlmICh4cy5pbmRleE9mKSB7XG4gICAgICAgIHJldHVybiB4cy5pbmRleE9mKHgpO1xuICAgICAgfVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB4cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKHhzW2ldID09PSB4KSB7XG4gICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNNYXAoeCkge1xuICAgICAgaWYgKCFtYXBTaXplIHx8ICF4IHx8IHR5cGVvZiB4ICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIG1hcFNpemUuY2FsbCh4KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBzZXRTaXplLmNhbGwoeCk7XG4gICAgICAgIH0gY2F0Y2ggKHMpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geCBpbnN0YW5jZW9mIE1hcDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNXZWFrTWFwKHgpIHtcbiAgICAgIGlmICghd2Vha01hcEhhcyB8fCAheCB8fCB0eXBlb2YgeCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICB3ZWFrTWFwSGFzLmNhbGwoeCwgd2Vha01hcEhhcyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgd2Vha1NldEhhcy5jYWxsKHgsIHdlYWtTZXRIYXMpO1xuICAgICAgICB9IGNhdGNoIChzKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHggaW5zdGFuY2VvZiBXZWFrTWFwO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc1dlYWtSZWYoeCkge1xuICAgICAgaWYgKCF3ZWFrUmVmRGVyZWYgfHwgIXggfHwgdHlwZW9mIHggIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgd2Vha1JlZkRlcmVmLmNhbGwoeCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc1NldCh4KSB7XG4gICAgICBpZiAoIXNldFNpemUgfHwgIXggfHwgdHlwZW9mIHggIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgc2V0U2l6ZS5jYWxsKHgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIG1hcFNpemUuY2FsbCh4KTtcbiAgICAgICAgfSBjYXRjaCAobSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB4IGluc3RhbmNlb2YgU2V0O1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc1dlYWtTZXQoeCkge1xuICAgICAgaWYgKCF3ZWFrU2V0SGFzIHx8ICF4IHx8IHR5cGVvZiB4ICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIHdlYWtTZXRIYXMuY2FsbCh4LCB3ZWFrU2V0SGFzKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB3ZWFrTWFwSGFzLmNhbGwoeCwgd2Vha01hcEhhcyk7XG4gICAgICAgIH0gY2F0Y2ggKHMpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geCBpbnN0YW5jZW9mIFdlYWtTZXQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzRWxlbWVudCh4KSB7XG4gICAgICBpZiAoIXggfHwgdHlwZW9mIHggIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBIVE1MRWxlbWVudCAhPT0gXCJ1bmRlZmluZWRcIiAmJiB4IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHlwZW9mIHgubm9kZU5hbWUgPT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIHguZ2V0QXR0cmlidXRlID09PSBcImZ1bmN0aW9uXCI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGluc3BlY3RTdHJpbmcoc3RyLCBvcHRzKSB7XG4gICAgICBpZiAoc3RyLmxlbmd0aCA+IG9wdHMubWF4U3RyaW5nTGVuZ3RoKSB7XG4gICAgICAgIHZhciByZW1haW5pbmcgPSBzdHIubGVuZ3RoIC0gb3B0cy5tYXhTdHJpbmdMZW5ndGg7XG4gICAgICAgIHZhciB0cmFpbGVyID0gXCIuLi4gXCIgKyByZW1haW5pbmcgKyBcIiBtb3JlIGNoYXJhY3RlclwiICsgKHJlbWFpbmluZyA+IDEgPyBcInNcIiA6IFwiXCIpO1xuICAgICAgICByZXR1cm4gaW5zcGVjdFN0cmluZygkc2xpY2UuY2FsbChzdHIsIDAsIG9wdHMubWF4U3RyaW5nTGVuZ3RoKSwgb3B0cykgKyB0cmFpbGVyO1xuICAgICAgfVxuICAgICAgdmFyIHF1b3RlUkUgPSBxdW90ZVJFc1tvcHRzLnF1b3RlU3R5bGUgfHwgXCJzaW5nbGVcIl07XG4gICAgICBxdW90ZVJFLmxhc3RJbmRleCA9IDA7XG4gICAgICB2YXIgcyA9ICRyZXBsYWNlLmNhbGwoJHJlcGxhY2UuY2FsbChzdHIsIHF1b3RlUkUsIFwiXFxcXCQxXCIpLCAvW1xceDAwLVxceDFmXS9nLCBsb3dieXRlKTtcbiAgICAgIHJldHVybiB3cmFwUXVvdGVzKHMsIFwic2luZ2xlXCIsIG9wdHMpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBsb3dieXRlKGMpIHtcbiAgICAgIHZhciBuID0gYy5jaGFyQ29kZUF0KDApO1xuICAgICAgdmFyIHggPSB7XG4gICAgICAgIDg6IFwiYlwiLFxuICAgICAgICA5OiBcInRcIixcbiAgICAgICAgMTA6IFwiblwiLFxuICAgICAgICAxMjogXCJmXCIsXG4gICAgICAgIDEzOiBcInJcIlxuICAgICAgfVtuXTtcbiAgICAgIGlmICh4KSB7XG4gICAgICAgIHJldHVybiBcIlxcXFxcIiArIHg7XG4gICAgICB9XG4gICAgICByZXR1cm4gXCJcXFxceFwiICsgKG4gPCAxNiA/IFwiMFwiIDogXCJcIikgKyAkdG9VcHBlckNhc2UuY2FsbChuLnRvU3RyaW5nKDE2KSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG1hcmtCb3hlZChzdHIpIHtcbiAgICAgIHJldHVybiBcIk9iamVjdChcIiArIHN0ciArIFwiKVwiO1xuICAgIH1cbiAgICBmdW5jdGlvbiB3ZWFrQ29sbGVjdGlvbk9mKHR5cGUpIHtcbiAgICAgIHJldHVybiB0eXBlICsgXCIgeyA/IH1cIjtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29sbGVjdGlvbk9mKHR5cGUsIHNpemUsIGVudHJpZXMsIGluZGVudCkge1xuICAgICAgdmFyIGpvaW5lZEVudHJpZXMgPSBpbmRlbnQgPyBpbmRlbnRlZEpvaW4oZW50cmllcywgaW5kZW50KSA6ICRqb2luLmNhbGwoZW50cmllcywgXCIsIFwiKTtcbiAgICAgIHJldHVybiB0eXBlICsgXCIgKFwiICsgc2l6ZSArIFwiKSB7XCIgKyBqb2luZWRFbnRyaWVzICsgXCJ9XCI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNpbmdsZUxpbmVWYWx1ZXMoeHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGluZGV4T2YoeHNbaV0sIFwiXFxuXCIpID49IDApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXRJbmRlbnQob3B0cywgZGVwdGgpIHtcbiAgICAgIHZhciBiYXNlSW5kZW50O1xuICAgICAgaWYgKG9wdHMuaW5kZW50ID09PSBcIlx0XCIpIHtcbiAgICAgICAgYmFzZUluZGVudCA9IFwiXHRcIjtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdHMuaW5kZW50ID09PSBcIm51bWJlclwiICYmIG9wdHMuaW5kZW50ID4gMCkge1xuICAgICAgICBiYXNlSW5kZW50ID0gJGpvaW4uY2FsbChBcnJheShvcHRzLmluZGVudCArIDEpLCBcIiBcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGJhc2U6IGJhc2VJbmRlbnQsXG4gICAgICAgIHByZXY6ICRqb2luLmNhbGwoQXJyYXkoZGVwdGggKyAxKSwgYmFzZUluZGVudClcbiAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGluZGVudGVkSm9pbih4cywgaW5kZW50KSB7XG4gICAgICBpZiAoeHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgfVxuICAgICAgdmFyIGxpbmVKb2luZXIgPSBcIlxcblwiICsgaW5kZW50LnByZXYgKyBpbmRlbnQuYmFzZTtcbiAgICAgIHJldHVybiBsaW5lSm9pbmVyICsgJGpvaW4uY2FsbCh4cywgXCIsXCIgKyBsaW5lSm9pbmVyKSArIFwiXFxuXCIgKyBpbmRlbnQucHJldjtcbiAgICB9XG4gICAgZnVuY3Rpb24gYXJyT2JqS2V5cyhvYmosIGluc3BlY3QzKSB7XG4gICAgICB2YXIgaXNBcnIgPSBpc0FycmF5KG9iaik7XG4gICAgICB2YXIgeHMgPSBbXTtcbiAgICAgIGlmIChpc0Fycikge1xuICAgICAgICB4cy5sZW5ndGggPSBvYmoubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iai5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHhzW2ldID0gaGFzKG9iaiwgaSkgPyBpbnNwZWN0MyhvYmpbaV0sIG9iaikgOiBcIlwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgc3ltcyA9IHR5cGVvZiBnT1BTID09PSBcImZ1bmN0aW9uXCIgPyBnT1BTKG9iaikgOiBbXTtcbiAgICAgIHZhciBzeW1NYXA7XG4gICAgICBpZiAoaGFzU2hhbW1lZFN5bWJvbHMpIHtcbiAgICAgICAgc3ltTWFwID0ge307XG4gICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgc3ltcy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgIHN5bU1hcFtcIiRcIiArIHN5bXNba11dID0gc3ltc1trXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICBpZiAoIWhhcyhvYmosIGtleSkpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNBcnIgJiYgU3RyaW5nKE51bWJlcihrZXkpKSA9PT0ga2V5ICYmIGtleSA8IG9iai5sZW5ndGgpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzU2hhbW1lZFN5bWJvbHMgJiYgc3ltTWFwW1wiJFwiICsga2V5XSBpbnN0YW5jZW9mIFN5bWJvbCkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9IGVsc2UgaWYgKCR0ZXN0LmNhbGwoL1teXFx3JF0vLCBrZXkpKSB7XG4gICAgICAgICAgeHMucHVzaChpbnNwZWN0MyhrZXksIG9iaikgKyBcIjogXCIgKyBpbnNwZWN0MyhvYmpba2V5XSwgb2JqKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgeHMucHVzaChrZXkgKyBcIjogXCIgKyBpbnNwZWN0MyhvYmpba2V5XSwgb2JqKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgZ09QUyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3ltcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGlmIChpc0VudW1lcmFibGUuY2FsbChvYmosIHN5bXNbal0pKSB7XG4gICAgICAgICAgICB4cy5wdXNoKFwiW1wiICsgaW5zcGVjdDMoc3ltc1tqXSkgKyBcIl06IFwiICsgaW5zcGVjdDMob2JqW3N5bXNbal1dLCBvYmopKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB4cztcbiAgICB9XG4gIH1cbn0pO1xuXG4vLyBzcmMvbGliL2JpbmFyeV9yZWFkZXIudHNcbnZhciB0ZXh0RGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcihcInV0Zi04XCIpO1xudmFyIEJpbmFyeVJlYWRlciA9IGNsYXNzIHtcbiAgLyoqXG4gICAqIFRoZSBEYXRhVmlldyB1c2VkIHRvIHJlYWQgdmFsdWVzIGZyb20gdGhlIGJpbmFyeSBkYXRhLlxuICAgKlxuICAgKiBOb3RlOiBUaGUgRGF0YVZpZXcncyBgYnl0ZU9mZnNldGAgaXMgcmVsYXRpdmUgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGVcbiAgICogdW5kZXJseWluZyBBcnJheUJ1ZmZlciwgbm90IHRoZSBzdGFydCBvZiB0aGUgcHJvdmlkZWQgVWludDhBcnJheSBpbnB1dC5cbiAgICogVGhpcyBgQmluYXJ5UmVhZGVyYCdzIGAjb2Zmc2V0YCBmaWVsZCBpcyB1c2VkIHRvIHRyYWNrIHRoZSBjdXJyZW50IHJlYWQgcG9zaXRpb25cbiAgICogcmVsYXRpdmUgdG8gdGhlIHN0YXJ0IG9mIHRoZSBwcm92aWRlZCBVaW50OEFycmF5IGlucHV0LlxuICAgKi9cbiAgdmlldztcbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgdGhlIG9mZnNldCAoaW4gYnl0ZXMpIHJlbGF0aXZlIHRvIHRoZSBzdGFydCBvZiB0aGUgRGF0YVZpZXdcbiAgICogYW5kIHByb3ZpZGVkIFVpbnQ4QXJyYXkgaW5wdXQuXG4gICAqXG4gICAqIE5vdGU6IFRoaXMgaXMgKm5vdCogdGhlIGFic29sdXRlIGJ5dGUgb2Zmc2V0IHdpdGhpbiB0aGUgdW5kZXJseWluZyBBcnJheUJ1ZmZlci5cbiAgICovXG4gIG9mZnNldCA9IDA7XG4gIGNvbnN0cnVjdG9yKGlucHV0KSB7XG4gICAgdGhpcy52aWV3ID0gaW5wdXQgaW5zdGFuY2VvZiBEYXRhVmlldyA/IGlucHV0IDogbmV3IERhdGFWaWV3KGlucHV0LmJ1ZmZlciwgaW5wdXQuYnl0ZU9mZnNldCwgaW5wdXQuYnl0ZUxlbmd0aCk7XG4gICAgdGhpcy5vZmZzZXQgPSAwO1xuICB9XG4gIHJlc2V0KGlucHV0KSB7XG4gICAgdGhpcy52aWV3ID0gaW5wdXQgaW5zdGFuY2VvZiBEYXRhVmlldyA/IGlucHV0IDogbmV3IERhdGFWaWV3KGlucHV0LmJ1ZmZlciwgaW5wdXQuYnl0ZU9mZnNldCwgaW5wdXQuYnl0ZUxlbmd0aCk7XG4gICAgdGhpcy5vZmZzZXQgPSAwO1xuICB9XG4gIGdldCByZW1haW5pbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMudmlldy5ieXRlTGVuZ3RoIC0gdGhpcy5vZmZzZXQ7XG4gIH1cbiAgLyoqIEVuc3VyZSB3ZSBoYXZlIGF0IGxlYXN0IGBuYCBieXRlcyBsZWZ0IHRvIHJlYWQgKi9cbiAgI2Vuc3VyZShuKSB7XG4gICAgaWYgKHRoaXMub2Zmc2V0ICsgbiA+IHRoaXMudmlldy5ieXRlTGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcbiAgICAgICAgYFRyaWVkIHRvIHJlYWQgJHtufSBieXRlKHMpIGF0IHJlbGF0aXZlIG9mZnNldCAke3RoaXMub2Zmc2V0fSwgYnV0IG9ubHkgJHt0aGlzLnJlbWFpbmluZ30gYnl0ZShzKSByZW1haW5gXG4gICAgICApO1xuICAgIH1cbiAgfVxuICByZWFkVUludDhBcnJheSgpIHtcbiAgICBjb25zdCBsZW5ndGggPSB0aGlzLnJlYWRVMzIoKTtcbiAgICB0aGlzLiNlbnN1cmUobGVuZ3RoKTtcbiAgICByZXR1cm4gdGhpcy5yZWFkQnl0ZXMobGVuZ3RoKS5zbGljZSgpO1xuICB9XG4gIHJlYWRCb29sKCkge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldFVpbnQ4KHRoaXMub2Zmc2V0KTtcbiAgICB0aGlzLm9mZnNldCArPSAxO1xuICAgIHJldHVybiB2YWx1ZSAhPT0gMDtcbiAgfVxuICByZWFkQnl0ZSgpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRVaW50OCh0aGlzLm9mZnNldCk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmVhZEJ5dGVzKGxlbmd0aCkge1xuICAgIGNvbnN0IGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoXG4gICAgICB0aGlzLnZpZXcuYnVmZmVyLFxuICAgICAgdGhpcy52aWV3LmJ5dGVPZmZzZXQgKyB0aGlzLm9mZnNldCxcbiAgICAgIGxlbmd0aFxuICAgICk7XG4gICAgdGhpcy5vZmZzZXQgKz0gbGVuZ3RoO1xuICAgIHJldHVybiBhcnJheTtcbiAgfVxuICByZWFkSTgoKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0SW50OCh0aGlzLm9mZnNldCk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmVhZFU4KCkge1xuICAgIHJldHVybiB0aGlzLnJlYWRCeXRlKCk7XG4gIH1cbiAgcmVhZEkxNigpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRJbnQxNih0aGlzLm9mZnNldCwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMjtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmVhZFUxNigpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRVaW50MTYodGhpcy5vZmZzZXQsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDI7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJlYWRJMzIoKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0SW50MzIodGhpcy5vZmZzZXQsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDQ7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJlYWRVMzIoKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0VWludDMyKHRoaXMub2Zmc2V0LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSA0O1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZWFkSTY0KCkge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldEJpZ0ludDY0KHRoaXMub2Zmc2V0LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSA4O1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZWFkVTY0KCkge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gODtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmVhZFUxMjgoKSB7XG4gICAgY29uc3QgbG93ZXJQYXJ0ID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCwgdHJ1ZSk7XG4gICAgY29uc3QgdXBwZXJQYXJ0ID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDgsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDE2O1xuICAgIHJldHVybiAodXBwZXJQYXJ0IDw8IEJpZ0ludCg2NCkpICsgbG93ZXJQYXJ0O1xuICB9XG4gIHJlYWRJMTI4KCkge1xuICAgIGNvbnN0IGxvd2VyUGFydCA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQsIHRydWUpO1xuICAgIGNvbnN0IHVwcGVyUGFydCA9IHRoaXMudmlldy5nZXRCaWdJbnQ2NCh0aGlzLm9mZnNldCArIDgsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDE2O1xuICAgIHJldHVybiAodXBwZXJQYXJ0IDw8IEJpZ0ludCg2NCkpICsgbG93ZXJQYXJ0O1xuICB9XG4gIHJlYWRVMjU2KCkge1xuICAgIGNvbnN0IHAwID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCwgdHJ1ZSk7XG4gICAgY29uc3QgcDEgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCwgdHJ1ZSk7XG4gICAgY29uc3QgcDIgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgMTYsIHRydWUpO1xuICAgIGNvbnN0IHAzID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDI0LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSAzMjtcbiAgICByZXR1cm4gKHAzIDw8IEJpZ0ludCgzICogNjQpKSArIChwMiA8PCBCaWdJbnQoMiAqIDY0KSkgKyAocDEgPDwgQmlnSW50KDEgKiA2NCkpICsgcDA7XG4gIH1cbiAgcmVhZEkyNTYoKSB7XG4gICAgY29uc3QgcDAgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0LCB0cnVlKTtcbiAgICBjb25zdCBwMSA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4LCB0cnVlKTtcbiAgICBjb25zdCBwMiA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyAxNiwgdHJ1ZSk7XG4gICAgY29uc3QgcDMgPSB0aGlzLnZpZXcuZ2V0QmlnSW50NjQodGhpcy5vZmZzZXQgKyAyNCwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMzI7XG4gICAgcmV0dXJuIChwMyA8PCBCaWdJbnQoMyAqIDY0KSkgKyAocDIgPDwgQmlnSW50KDIgKiA2NCkpICsgKHAxIDw8IEJpZ0ludCgxICogNjQpKSArIHAwO1xuICB9XG4gIHJlYWRGMzIoKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0RmxvYXQzMih0aGlzLm9mZnNldCwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gNDtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmVhZEY2NCgpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRGbG9hdDY0KHRoaXMub2Zmc2V0LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSA4O1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZWFkU3RyaW5nKCkge1xuICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMucmVhZFUzMigpO1xuICAgIHRoaXMuI2Vuc3VyZShsZW5ndGgpO1xuICAgIGNvbnN0IGJ5dGVzID0gdGhpcy5yZWFkQnl0ZXMobGVuZ3RoKTtcbiAgICByZXR1cm4gdGV4dERlY29kZXIuZGVjb2RlKGJ5dGVzKTtcbiAgfVxufTtcblxuLy8gc3JjL2xpYi9iaW5hcnlfd3JpdGVyLnRzXG52YXIgaW1wb3J0X2Jhc2U2NF9qcyA9IF9fdG9FU00ocmVxdWlyZV9iYXNlNjRfanMoKSk7XG52YXIgdGV4dEVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcbnZhciBBcnJheUJ1ZmZlclByb3RvdHlwZVRyYW5zZmVyID0gQXJyYXlCdWZmZXIucHJvdG90eXBlLnRyYW5zZmVyID8/IGZ1bmN0aW9uKG5ld0J5dGVMZW5ndGgpIHtcbiAgaWYgKG5ld0J5dGVMZW5ndGggPT09IHZvaWQgMCkge1xuICAgIHJldHVybiB0aGlzLnNsaWNlKCk7XG4gIH0gZWxzZSBpZiAobmV3Qnl0ZUxlbmd0aCA8PSB0aGlzLmJ5dGVMZW5ndGgpIHtcbiAgICByZXR1cm4gdGhpcy5zbGljZSgwLCBuZXdCeXRlTGVuZ3RoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBjb3B5ID0gbmV3IFVpbnQ4QXJyYXkobmV3Qnl0ZUxlbmd0aCk7XG4gICAgY29weS5zZXQobmV3IFVpbnQ4QXJyYXkodGhpcykpO1xuICAgIHJldHVybiBjb3B5LmJ1ZmZlcjtcbiAgfVxufTtcbnZhciBSZXNpemFibGVCdWZmZXIgPSBjbGFzcyB7XG4gIGJ1ZmZlcjtcbiAgdmlldztcbiAgY29uc3RydWN0b3IoaW5pdCkge1xuICAgIHRoaXMuYnVmZmVyID0gdHlwZW9mIGluaXQgPT09IFwibnVtYmVyXCIgPyBuZXcgQXJyYXlCdWZmZXIoaW5pdCkgOiBpbml0O1xuICAgIHRoaXMudmlldyA9IG5ldyBEYXRhVmlldyh0aGlzLmJ1ZmZlcik7XG4gIH1cbiAgZ2V0IGNhcGFjaXR5KCkge1xuICAgIHJldHVybiB0aGlzLmJ1ZmZlci5ieXRlTGVuZ3RoO1xuICB9XG4gIGdyb3cobmV3U2l6ZSkge1xuICAgIGlmIChuZXdTaXplIDw9IHRoaXMuYnVmZmVyLmJ5dGVMZW5ndGgpIHJldHVybjtcbiAgICB0aGlzLmJ1ZmZlciA9IEFycmF5QnVmZmVyUHJvdG90eXBlVHJhbnNmZXIuY2FsbCh0aGlzLmJ1ZmZlciwgbmV3U2l6ZSk7XG4gICAgdGhpcy52aWV3ID0gbmV3IERhdGFWaWV3KHRoaXMuYnVmZmVyKTtcbiAgfVxufTtcbnZhciBCaW5hcnlXcml0ZXIgPSBjbGFzcyB7XG4gIGJ1ZmZlcjtcbiAgb2Zmc2V0ID0gMDtcbiAgY29uc3RydWN0b3IoaW5pdCkge1xuICAgIHRoaXMuYnVmZmVyID0gdHlwZW9mIGluaXQgPT09IFwibnVtYmVyXCIgPyBuZXcgUmVzaXphYmxlQnVmZmVyKGluaXQpIDogaW5pdDtcbiAgfVxuICBjbGVhcigpIHtcbiAgICB0aGlzLm9mZnNldCA9IDA7XG4gIH1cbiAgcmVzZXQoYnVmZmVyKSB7XG4gICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG4gICAgdGhpcy5vZmZzZXQgPSAwO1xuICB9XG4gIGV4cGFuZEJ1ZmZlcihhZGRpdGlvbmFsQ2FwYWNpdHkpIHtcbiAgICBjb25zdCBtaW5DYXBhY2l0eSA9IHRoaXMub2Zmc2V0ICsgYWRkaXRpb25hbENhcGFjaXR5ICsgMTtcbiAgICBpZiAobWluQ2FwYWNpdHkgPD0gdGhpcy5idWZmZXIuY2FwYWNpdHkpIHJldHVybjtcbiAgICBsZXQgbmV3Q2FwYWNpdHkgPSB0aGlzLmJ1ZmZlci5jYXBhY2l0eSAqIDI7XG4gICAgaWYgKG5ld0NhcGFjaXR5IDwgbWluQ2FwYWNpdHkpIG5ld0NhcGFjaXR5ID0gbWluQ2FwYWNpdHk7XG4gICAgdGhpcy5idWZmZXIuZ3JvdyhuZXdDYXBhY2l0eSk7XG4gIH1cbiAgdG9CYXNlNjQoKSB7XG4gICAgcmV0dXJuICgwLCBpbXBvcnRfYmFzZTY0X2pzLmZyb21CeXRlQXJyYXkpKHRoaXMuZ2V0QnVmZmVyKCkpO1xuICB9XG4gIGdldEJ1ZmZlcigpIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkodGhpcy5idWZmZXIuYnVmZmVyLCAwLCB0aGlzLm9mZnNldCk7XG4gIH1cbiAgZ2V0IHZpZXcoKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyLnZpZXc7XG4gIH1cbiAgd3JpdGVVSW50OEFycmF5KHZhbHVlKSB7XG4gICAgY29uc3QgbGVuZ3RoID0gdmFsdWUubGVuZ3RoO1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDQgKyBsZW5ndGgpO1xuICAgIHRoaXMud3JpdGVVMzIobGVuZ3RoKTtcbiAgICBuZXcgVWludDhBcnJheSh0aGlzLmJ1ZmZlci5idWZmZXIsIHRoaXMub2Zmc2V0KS5zZXQodmFsdWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IGxlbmd0aDtcbiAgfVxuICB3cml0ZUJvb2wodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigxKTtcbiAgICB0aGlzLnZpZXcuc2V0VWludDgodGhpcy5vZmZzZXQsIHZhbHVlID8gMSA6IDApO1xuICAgIHRoaXMub2Zmc2V0ICs9IDE7XG4gIH1cbiAgd3JpdGVCeXRlKHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMSk7XG4gICAgdGhpcy52aWV3LnNldFVpbnQ4KHRoaXMub2Zmc2V0LCB2YWx1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMTtcbiAgfVxuICB3cml0ZUJ5dGVzKHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIodmFsdWUubGVuZ3RoKTtcbiAgICBuZXcgVWludDhBcnJheSh0aGlzLmJ1ZmZlci5idWZmZXIsIHRoaXMub2Zmc2V0LCB2YWx1ZS5sZW5ndGgpLnNldCh2YWx1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gdmFsdWUubGVuZ3RoO1xuICB9XG4gIHdyaXRlSTgodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigxKTtcbiAgICB0aGlzLnZpZXcuc2V0SW50OCh0aGlzLm9mZnNldCwgdmFsdWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDE7XG4gIH1cbiAgd3JpdGVVOCh2YWx1ZSkge1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDEpO1xuICAgIHRoaXMudmlldy5zZXRVaW50OCh0aGlzLm9mZnNldCwgdmFsdWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDE7XG4gIH1cbiAgd3JpdGVJMTYodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigyKTtcbiAgICB0aGlzLnZpZXcuc2V0SW50MTYodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSAyO1xuICB9XG4gIHdyaXRlVTE2KHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMik7XG4gICAgdGhpcy52aWV3LnNldFVpbnQxNih0aGlzLm9mZnNldCwgdmFsdWUsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDI7XG4gIH1cbiAgd3JpdGVJMzIodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcig0KTtcbiAgICB0aGlzLnZpZXcuc2V0SW50MzIodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSA0O1xuICB9XG4gIHdyaXRlVTMyKHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoNCk7XG4gICAgdGhpcy52aWV3LnNldFVpbnQzMih0aGlzLm9mZnNldCwgdmFsdWUsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDQ7XG4gIH1cbiAgd3JpdGVJNjQodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcig4KTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnSW50NjQodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSA4O1xuICB9XG4gIHdyaXRlVTY0KHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoOCk7XG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCwgdmFsdWUsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDg7XG4gIH1cbiAgd3JpdGVVMTI4KHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMTYpO1xuICAgIGNvbnN0IGxvd2VyUGFydCA9IHZhbHVlICYgQmlnSW50KFwiMHhGRkZGRkZGRkZGRkZGRkZGXCIpO1xuICAgIGNvbnN0IHVwcGVyUGFydCA9IHZhbHVlID4+IEJpZ0ludCg2NCk7XG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCwgbG93ZXJQYXJ0LCB0cnVlKTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCwgdXBwZXJQYXJ0LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSAxNjtcbiAgfVxuICB3cml0ZUkxMjgodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigxNik7XG4gICAgY29uc3QgbG93ZXJQYXJ0ID0gdmFsdWUgJiBCaWdJbnQoXCIweEZGRkZGRkZGRkZGRkZGRkZcIik7XG4gICAgY29uc3QgdXBwZXJQYXJ0ID0gdmFsdWUgPj4gQmlnSW50KDY0KTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnSW50NjQodGhpcy5vZmZzZXQsIGxvd2VyUGFydCwgdHJ1ZSk7XG4gICAgdGhpcy52aWV3LnNldEJpZ0ludDY0KHRoaXMub2Zmc2V0ICsgOCwgdXBwZXJQYXJ0LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSAxNjtcbiAgfVxuICB3cml0ZVUyNTYodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigzMik7XG4gICAgY29uc3QgbG93XzY0X21hc2sgPSBCaWdJbnQoXCIweEZGRkZGRkZGRkZGRkZGRkZcIik7XG4gICAgY29uc3QgcDAgPSB2YWx1ZSAmIGxvd182NF9tYXNrO1xuICAgIGNvbnN0IHAxID0gdmFsdWUgPj4gQmlnSW50KDY0ICogMSkgJiBsb3dfNjRfbWFzaztcbiAgICBjb25zdCBwMiA9IHZhbHVlID4+IEJpZ0ludCg2NCAqIDIpICYgbG93XzY0X21hc2s7XG4gICAgY29uc3QgcDMgPSB2YWx1ZSA+PiBCaWdJbnQoNjQgKiAzKTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDAsIHAwLCB0cnVlKTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDEsIHAxLCB0cnVlKTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDIsIHAyLCB0cnVlKTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDMsIHAzLCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSAzMjtcbiAgfVxuICB3cml0ZUkyNTYodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigzMik7XG4gICAgY29uc3QgbG93XzY0X21hc2sgPSBCaWdJbnQoXCIweEZGRkZGRkZGRkZGRkZGRkZcIik7XG4gICAgY29uc3QgcDAgPSB2YWx1ZSAmIGxvd182NF9tYXNrO1xuICAgIGNvbnN0IHAxID0gdmFsdWUgPj4gQmlnSW50KDY0ICogMSkgJiBsb3dfNjRfbWFzaztcbiAgICBjb25zdCBwMiA9IHZhbHVlID4+IEJpZ0ludCg2NCAqIDIpICYgbG93XzY0X21hc2s7XG4gICAgY29uc3QgcDMgPSB2YWx1ZSA+PiBCaWdJbnQoNjQgKiAzKTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDAsIHAwLCB0cnVlKTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDEsIHAxLCB0cnVlKTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDIsIHAyLCB0cnVlKTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnSW50NjQodGhpcy5vZmZzZXQgKyA4ICogMywgcDMsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDMyO1xuICB9XG4gIHdyaXRlRjMyKHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoNCk7XG4gICAgdGhpcy52aWV3LnNldEZsb2F0MzIodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSA0O1xuICB9XG4gIHdyaXRlRjY0KHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoOCk7XG4gICAgdGhpcy52aWV3LnNldEZsb2F0NjQodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSA4O1xuICB9XG4gIHdyaXRlU3RyaW5nKHZhbHVlKSB7XG4gICAgY29uc3QgbGVuID0gdmFsdWUubGVuZ3RoO1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDQgKyBsZW4pO1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5idWZmZXIuYnVmZmVyKTtcbiAgICBsZXQgb2Zmc2V0ID0gdGhpcy5vZmZzZXQgKyA0O1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBjID0gdmFsdWUuY2hhckNvZGVBdChpKTtcbiAgICAgIGlmIChjID49IDEyOCkgYnJlYWs7XG4gICAgICBieXRlc1tvZmZzZXQrK10gPSBjO1xuICAgIH1cbiAgICBpZiAoaSA9PT0gbGVuKSB7XG4gICAgICB0aGlzLnZpZXcuc2V0VWludDMyKHRoaXMub2Zmc2V0LCBsZW4sIHRydWUpO1xuICAgICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMud3JpdGVVSW50OEFycmF5KHRleHRFbmNvZGVyLmVuY29kZSh2YWx1ZSkpO1xuICB9XG59O1xuXG4vLyBzcmMvbGliL3V0aWwudHNcbmZ1bmN0aW9uIHVpbnQ4QXJyYXlUb0hleFN0cmluZyhhcnJheSkge1xuICByZXR1cm4gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGFycmF5LnJldmVyc2UoKSwgKHgpID0+IChcIjAwXCIgKyB4LnRvU3RyaW5nKDE2KSkuc2xpY2UoLTIpKS5qb2luKFwiXCIpO1xufVxuZnVuY3Rpb24gdWludDhBcnJheVRvVTEyOChhcnJheSkge1xuICBpZiAoYXJyYXkubGVuZ3RoICE9IDE2KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVaW50OEFycmF5IGlzIG5vdCAxNiBieXRlcyBsb25nOiAke2FycmF5fWApO1xuICB9XG4gIHJldHVybiBuZXcgQmluYXJ5UmVhZGVyKGFycmF5KS5yZWFkVTEyOCgpO1xufVxuZnVuY3Rpb24gdWludDhBcnJheVRvVTI1NihhcnJheSkge1xuICBpZiAoYXJyYXkubGVuZ3RoICE9IDMyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVaW50OEFycmF5IGlzIG5vdCAzMiBieXRlcyBsb25nOiBbJHthcnJheX1dYCk7XG4gIH1cbiAgcmV0dXJuIG5ldyBCaW5hcnlSZWFkZXIoYXJyYXkpLnJlYWRVMjU2KCk7XG59XG5mdW5jdGlvbiBoZXhTdHJpbmdUb1VpbnQ4QXJyYXkoc3RyKSB7XG4gIGlmIChzdHIuc3RhcnRzV2l0aChcIjB4XCIpKSB7XG4gICAgc3RyID0gc3RyLnNsaWNlKDIpO1xuICB9XG4gIGNvbnN0IG1hdGNoZXMgPSBzdHIubWF0Y2goLy57MSwyfS9nKSB8fCBbXTtcbiAgY29uc3QgZGF0YSA9IFVpbnQ4QXJyYXkuZnJvbShcbiAgICBtYXRjaGVzLm1hcCgoYnl0ZSkgPT4gcGFyc2VJbnQoYnl0ZSwgMTYpKVxuICApO1xuICByZXR1cm4gZGF0YS5yZXZlcnNlKCk7XG59XG5mdW5jdGlvbiBoZXhTdHJpbmdUb1UxMjgoc3RyKSB7XG4gIHJldHVybiB1aW50OEFycmF5VG9VMTI4KGhleFN0cmluZ1RvVWludDhBcnJheShzdHIpKTtcbn1cbmZ1bmN0aW9uIGhleFN0cmluZ1RvVTI1NihzdHIpIHtcbiAgcmV0dXJuIHVpbnQ4QXJyYXlUb1UyNTYoaGV4U3RyaW5nVG9VaW50OEFycmF5KHN0cikpO1xufVxuZnVuY3Rpb24gdTEyOFRvVWludDhBcnJheShkYXRhKSB7XG4gIGNvbnN0IHdyaXRlciA9IG5ldyBCaW5hcnlXcml0ZXIoMTYpO1xuICB3cml0ZXIud3JpdGVVMTI4KGRhdGEpO1xuICByZXR1cm4gd3JpdGVyLmdldEJ1ZmZlcigpO1xufVxuZnVuY3Rpb24gdTEyOFRvSGV4U3RyaW5nKGRhdGEpIHtcbiAgcmV0dXJuIHVpbnQ4QXJyYXlUb0hleFN0cmluZyh1MTI4VG9VaW50OEFycmF5KGRhdGEpKTtcbn1cbmZ1bmN0aW9uIHUyNTZUb1VpbnQ4QXJyYXkoZGF0YSkge1xuICBjb25zdCB3cml0ZXIgPSBuZXcgQmluYXJ5V3JpdGVyKDMyKTtcbiAgd3JpdGVyLndyaXRlVTI1NihkYXRhKTtcbiAgcmV0dXJuIHdyaXRlci5nZXRCdWZmZXIoKTtcbn1cbmZ1bmN0aW9uIHUyNTZUb0hleFN0cmluZyhkYXRhKSB7XG4gIHJldHVybiB1aW50OEFycmF5VG9IZXhTdHJpbmcodTI1NlRvVWludDhBcnJheShkYXRhKSk7XG59XG5mdW5jdGlvbiBjb2VyY2VUb0JpZ0ludCh2YWx1ZSwgd2hhdCkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSBcImJpZ2ludFwiKSByZXR1cm4gdmFsdWU7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpIHJldHVybiBCaWdJbnQodmFsdWUpO1xuICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiICYmIHZhbHVlLnRyaW0oKSAhPT0gXCJcIikgcmV0dXJuIEJpZ0ludCh2YWx1ZSk7XG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgYENhbm5vdCBjb252ZXJ0ICR7dHlwZW9mIHZhbHVlfSB0byAke3doYXR9OiBleHBlY3RlZCBiaWdpbnQsIGludGVnZXIgbnVtYmVyLCBvciBkZWNpbWFsIHN0cmluZ2BcbiAgKTtcbn1cbmZ1bmN0aW9uIHRvUGFzY2FsQ2FzZShzKSB7XG4gIGNvbnN0IHN0ciA9IHRvQ2FtZWxDYXNlKHMpO1xuICByZXR1cm4gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpO1xufVxuZnVuY3Rpb24gdG9DYW1lbENhc2Uocykge1xuICBjb25zdCBzdHIgPSBzLnJlcGxhY2UoL1stX10rL2csIFwiX1wiKS5yZXBsYWNlKC9fKFthLXpBLVowLTldKS9nLCAoXywgYykgPT4gYy50b1VwcGVyQ2FzZSgpKTtcbiAgcmV0dXJuIHN0ci5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKSArIHN0ci5zbGljZSgxKTtcbn1cbmZ1bmN0aW9uIGJzYXRuQmFzZVNpemUodHlwZXNwYWNlLCB0eSkge1xuICBjb25zdCBhc3N1bWVkQXJyYXlMZW5ndGggPSA0O1xuICB3aGlsZSAodHkudGFnID09PSBcIlJlZlwiKSB0eSA9IHR5cGVzcGFjZS50eXBlc1t0eS52YWx1ZV07XG4gIGlmICh0eS50YWcgPT09IFwiUHJvZHVjdFwiKSB7XG4gICAgbGV0IHN1bSA9IDA7XG4gICAgZm9yIChjb25zdCB7IGFsZ2VicmFpY1R5cGU6IGVsZW0gfSBvZiB0eS52YWx1ZS5lbGVtZW50cykge1xuICAgICAgc3VtICs9IGJzYXRuQmFzZVNpemUodHlwZXNwYWNlLCBlbGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIHN1bTtcbiAgfSBlbHNlIGlmICh0eS50YWcgPT09IFwiU3VtXCIpIHtcbiAgICBsZXQgbWluID0gSW5maW5pdHk7XG4gICAgZm9yIChjb25zdCB7IGFsZ2VicmFpY1R5cGU6IHZhcmkgfSBvZiB0eS52YWx1ZS52YXJpYW50cykge1xuICAgICAgY29uc3QgdlNpemUgPSBic2F0bkJhc2VTaXplKHR5cGVzcGFjZSwgdmFyaSk7XG4gICAgICBpZiAodlNpemUgPCBtaW4pIG1pbiA9IHZTaXplO1xuICAgIH1cbiAgICBpZiAobWluID09PSBJbmZpbml0eSkgbWluID0gMDtcbiAgICByZXR1cm4gNCArIG1pbjtcbiAgfSBlbHNlIGlmICh0eS50YWcgPT0gXCJBcnJheVwiKSB7XG4gICAgcmV0dXJuIDQgKyBhc3N1bWVkQXJyYXlMZW5ndGggKiBic2F0bkJhc2VTaXplKHR5cGVzcGFjZSwgdHkudmFsdWUpO1xuICB9XG4gIHJldHVybiB7XG4gICAgU3RyaW5nOiA0ICsgYXNzdW1lZEFycmF5TGVuZ3RoLFxuICAgIFN1bTogMSxcbiAgICBCb29sOiAxLFxuICAgIEk4OiAxLFxuICAgIFU4OiAxLFxuICAgIEkxNjogMixcbiAgICBVMTY6IDIsXG4gICAgSTMyOiA0LFxuICAgIFUzMjogNCxcbiAgICBGMzI6IDQsXG4gICAgSTY0OiA4LFxuICAgIFU2NDogOCxcbiAgICBGNjQ6IDgsXG4gICAgSTEyODogMTYsXG4gICAgVTEyODogMTYsXG4gICAgSTI1NjogMzIsXG4gICAgVTI1NjogMzJcbiAgfVt0eS50YWddO1xufVxudmFyIGhhc093biA9IE9iamVjdC5oYXNPd247XG5cbi8vIHNyYy9saWIvdGltZV9kdXJhdGlvbi50c1xudmFyIFRpbWVEdXJhdGlvbiA9IGNsYXNzIF9UaW1lRHVyYXRpb24ge1xuICBfX3RpbWVfZHVyYXRpb25fbWljcm9zX187XG4gIHN0YXRpYyBNSUNST1NfUEVSX01JTExJUyA9IDEwMDBuO1xuICAvKipcbiAgICogR2V0IHRoZSBhbGdlYnJhaWMgdHlwZSByZXByZXNlbnRhdGlvbiBvZiB0aGUge0BsaW5rIFRpbWVEdXJhdGlvbn0gdHlwZS5cbiAgICogQHJldHVybnMgVGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0eXBlLlxuICAgKi9cbiAgc3RhdGljIGdldEFsZ2VicmFpY1R5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7XG4gICAgICBlbGVtZW50czogW1xuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogXCJfX3RpbWVfZHVyYXRpb25fbWljcm9zX19cIixcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLkk2NFxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSk7XG4gIH1cbiAgc3RhdGljIGlzVGltZUR1cmF0aW9uKGFsZ2VicmFpY1R5cGUpIHtcbiAgICBpZiAoYWxnZWJyYWljVHlwZS50YWcgIT09IFwiUHJvZHVjdFwiKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGVsZW1lbnRzID0gYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50cztcbiAgICBpZiAoZWxlbWVudHMubGVuZ3RoICE9PSAxKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IG1pY3Jvc0VsZW1lbnQgPSBlbGVtZW50c1swXTtcbiAgICByZXR1cm4gbWljcm9zRWxlbWVudC5uYW1lID09PSBcIl9fdGltZV9kdXJhdGlvbl9taWNyb3NfX1wiICYmIG1pY3Jvc0VsZW1lbnQuYWxnZWJyYWljVHlwZS50YWcgPT09IFwiSTY0XCI7XG4gIH1cbiAgZ2V0IG1pY3JvcygpIHtcbiAgICByZXR1cm4gdGhpcy5fX3RpbWVfZHVyYXRpb25fbWljcm9zX187XG4gIH1cbiAgZ2V0IG1pbGxpcygpIHtcbiAgICByZXR1cm4gTnVtYmVyKHRoaXMubWljcm9zIC8gX1RpbWVEdXJhdGlvbi5NSUNST1NfUEVSX01JTExJUyk7XG4gIH1cbiAgY29uc3RydWN0b3IobWljcm9zKSB7XG4gICAgdGhpcy5fX3RpbWVfZHVyYXRpb25fbWljcm9zX18gPSBjb2VyY2VUb0JpZ0ludChtaWNyb3MsIFwiVGltZUR1cmF0aW9uXCIpO1xuICB9XG4gIHN0YXRpYyBmcm9tTWlsbGlzKG1pbGxpcykge1xuICAgIHJldHVybiBuZXcgX1RpbWVEdXJhdGlvbihCaWdJbnQobWlsbGlzKSAqIF9UaW1lRHVyYXRpb24uTUlDUk9TX1BFUl9NSUxMSVMpO1xuICB9XG4gIC8qKiBUaGlzIG91dHB1dHMgdGhlIHNhbWUgc3RyaW5nIGZvcm1hdCB0aGF0IHdlIHVzZSBpbiB0aGUgaG9zdCBhbmQgaW4gUnVzdCBtb2R1bGVzICovXG4gIHRvU3RyaW5nKCkge1xuICAgIGNvbnN0IG1pY3JvcyA9IHRoaXMubWljcm9zO1xuICAgIGNvbnN0IHNpZ24gPSBtaWNyb3MgPCAwID8gXCItXCIgOiBcIitcIjtcbiAgICBjb25zdCBwb3MgPSBtaWNyb3MgPCAwID8gLW1pY3JvcyA6IG1pY3JvcztcbiAgICBjb25zdCBzZWNzID0gcG9zIC8gMTAwMDAwMG47XG4gICAgY29uc3QgbWljcm9zX3JlbWFpbmluZyA9IHBvcyAlIDEwMDAwMDBuO1xuICAgIHJldHVybiBgJHtzaWdufSR7c2Vjc30uJHtTdHJpbmcobWljcm9zX3JlbWFpbmluZykucGFkU3RhcnQoNiwgXCIwXCIpfWA7XG4gIH1cbn07XG5cbi8vIHNyYy9saWIvdGltZXN0YW1wLnRzXG52YXIgVGltZXN0YW1wID0gY2xhc3MgX1RpbWVzdGFtcCB7XG4gIF9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX187XG4gIHN0YXRpYyBNSUNST1NfUEVSX01JTExJUyA9IDEwMDBuO1xuICBnZXQgbWljcm9zU2luY2VVbml4RXBvY2goKSB7XG4gICAgcmV0dXJuIHRoaXMuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXztcbiAgfVxuICBjb25zdHJ1Y3RvcihtaWNyb3MpIHtcbiAgICB0aGlzLl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX18gPSBjb2VyY2VUb0JpZ0ludChcbiAgICAgIG1pY3JvcyxcbiAgICAgIFwiVGltZXN0YW1wXCJcbiAgICApO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgdGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB7QGxpbmsgVGltZXN0YW1wfSB0eXBlLlxuICAgKiBAcmV0dXJucyBUaGUgYWxnZWJyYWljIHR5cGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHR5cGUuXG4gICAqL1xuICBzdGF0aWMgZ2V0QWxnZWJyYWljVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHtcbiAgICAgIGVsZW1lbnRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBcIl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX19cIixcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLkk2NFxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSk7XG4gIH1cbiAgc3RhdGljIGlzVGltZXN0YW1wKGFsZ2VicmFpY1R5cGUpIHtcbiAgICBpZiAoYWxnZWJyYWljVHlwZS50YWcgIT09IFwiUHJvZHVjdFwiKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGVsZW1lbnRzID0gYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50cztcbiAgICBpZiAoZWxlbWVudHMubGVuZ3RoICE9PSAxKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IG1pY3Jvc0VsZW1lbnQgPSBlbGVtZW50c1swXTtcbiAgICByZXR1cm4gbWljcm9zRWxlbWVudC5uYW1lID09PSBcIl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX19cIiAmJiBtaWNyb3NFbGVtZW50LmFsZ2VicmFpY1R5cGUudGFnID09PSBcIkk2NFwiO1xuICB9XG4gIC8qKlxuICAgKiBUaGUgVW5peCBlcG9jaCwgdGhlIG1pZG5pZ2h0IGF0IHRoZSBiZWdpbm5pbmcgb2YgSmFudWFyeSAxLCAxOTcwLCBVVEMuXG4gICAqL1xuICBzdGF0aWMgVU5JWF9FUE9DSCA9IG5ldyBfVGltZXN0YW1wKDBuKTtcbiAgLyoqXG4gICAqIEdldCBhIGBUaW1lc3RhbXBgIHJlcHJlc2VudGluZyB0aGUgZXhlY3V0aW9uIGVudmlyb25tZW50J3MgYmVsaWVmIG9mIHRoZSBjdXJyZW50IG1vbWVudCBpbiB0aW1lLlxuICAgKi9cbiAgc3RhdGljIG5vdygpIHtcbiAgICByZXR1cm4gX1RpbWVzdGFtcC5mcm9tRGF0ZSgvKiBAX19QVVJFX18gKi8gbmV3IERhdGUoKSk7XG4gIH1cbiAgLyoqIENvbnZlcnQgdG8gbWlsbGlzZWNvbmRzIHNpbmNlIFVuaXggZXBvY2guICovXG4gIHRvTWlsbGlzKCkge1xuICAgIHJldHVybiB0aGlzLm1pY3Jvc1NpbmNlVW5peEVwb2NoIC8gMTAwMG47XG4gIH1cbiAgLyoqXG4gICAqIEdldCBhIGBUaW1lc3RhbXBgIHJlcHJlc2VudGluZyB0aGUgc2FtZSBwb2ludCBpbiB0aW1lIGFzIGBkYXRlYC5cbiAgICovXG4gIHN0YXRpYyBmcm9tRGF0ZShkYXRlKSB7XG4gICAgY29uc3QgbWlsbGlzID0gZGF0ZS5nZXRUaW1lKCk7XG4gICAgY29uc3QgbWljcm9zID0gQmlnSW50KG1pbGxpcykgKiBfVGltZXN0YW1wLk1JQ1JPU19QRVJfTUlMTElTO1xuICAgIHJldHVybiBuZXcgX1RpbWVzdGFtcChtaWNyb3MpO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgYSBgRGF0ZWAgcmVwcmVzZW50aW5nIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgcG9pbnQgaW4gdGltZSBhcyBgdGhpc2AuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIHRydW5jYXRlcyB0byBtaWxsaXNlY29uZCBwcmVjaXNpb24sXG4gICAqIGFuZCB0aHJvd3MgYFJhbmdlRXJyb3JgIGlmIHRoZSBgVGltZXN0YW1wYCBpcyBvdXRzaWRlIHRoZSByYW5nZSByZXByZXNlbnRhYmxlIGFzIGEgYERhdGVgLlxuICAgKi9cbiAgdG9EYXRlKCkge1xuICAgIGNvbnN0IG1pY3JvcyA9IHRoaXMuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXztcbiAgICBjb25zdCBtaWxsaXMgPSBtaWNyb3MgLyBfVGltZXN0YW1wLk1JQ1JPU19QRVJfTUlMTElTO1xuICAgIGlmIChtaWxsaXMgPiBCaWdJbnQoTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpIHx8IG1pbGxpcyA8IEJpZ0ludChOdW1iZXIuTUlOX1NBRkVfSU5URUdFUikpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFxuICAgICAgICBcIlRpbWVzdGFtcCBpcyBvdXRzaWRlIG9mIHRoZSByZXByZXNlbnRhYmxlIHJhbmdlIG9mIEpTJ3MgRGF0ZVwiXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IERhdGUoTnVtYmVyKG1pbGxpcykpO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgYW4gSVNPIDg2MDEgLyBSRkMgMzMzOSBmb3JtYXR0ZWQgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgdGltZXN0YW1wIHdpdGggbWljcm9zZWNvbmQgcHJlY2lzaW9uLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBwcmVzZXJ2ZXMgdGhlIGZ1bGwgbWljcm9zZWNvbmQgcHJlY2lzaW9uIG9mIHRoZSB0aW1lc3RhbXAsXG4gICAqIGFuZCB0aHJvd3MgYFJhbmdlRXJyb3JgIGlmIHRoZSBgVGltZXN0YW1wYCBpcyBvdXRzaWRlIHRoZSByYW5nZSByZXByZXNlbnRhYmxlIGluIElTTyBmb3JtYXQuXG4gICAqXG4gICAqIEByZXR1cm5zIElTTyA4NjAxIGZvcm1hdHRlZCBzdHJpbmcgd2l0aCBtaWNyb3NlY29uZCBwcmVjaXNpb24gKGUuZy4sICcyMDI1LTAyLTE3VDEwOjMwOjQ1LjEyMzQ1NlonKVxuICAgKi9cbiAgdG9JU09TdHJpbmcoKSB7XG4gICAgY29uc3QgbWljcm9zID0gdGhpcy5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fO1xuICAgIGNvbnN0IG1pbGxpcyA9IG1pY3JvcyAvIF9UaW1lc3RhbXAuTUlDUk9TX1BFUl9NSUxMSVM7XG4gICAgaWYgKG1pbGxpcyA+IEJpZ0ludChOdW1iZXIuTUFYX1NBRkVfSU5URUdFUikgfHwgbWlsbGlzIDwgQmlnSW50KE51bWJlci5NSU5fU0FGRV9JTlRFR0VSKSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXG4gICAgICAgIFwiVGltZXN0YW1wIGlzIG91dHNpZGUgb2YgdGhlIHJlcHJlc2VudGFibGUgcmFuZ2UgZm9yIElTTyBzdHJpbmcgZm9ybWF0dGluZ1wiXG4gICAgICApO1xuICAgIH1cbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoTnVtYmVyKG1pbGxpcykpO1xuICAgIGNvbnN0IGlzb0Jhc2UgPSBkYXRlLnRvSVNPU3RyaW5nKCk7XG4gICAgY29uc3QgbWljcm9zUmVtYWluZGVyID0gTWF0aC5hYnMoTnVtYmVyKG1pY3JvcyAlIDEwMDAwMDBuKSk7XG4gICAgY29uc3QgZnJhY3Rpb25hbFBhcnQgPSBTdHJpbmcobWljcm9zUmVtYWluZGVyKS5wYWRTdGFydCg2LCBcIjBcIik7XG4gICAgcmV0dXJuIGlzb0Jhc2UucmVwbGFjZSgvXFwuXFxkezN9WiQvLCBgLiR7ZnJhY3Rpb25hbFBhcnR9WmApO1xuICB9XG4gIHNpbmNlKG90aGVyKSB7XG4gICAgcmV0dXJuIG5ldyBUaW1lRHVyYXRpb24oXG4gICAgICB0aGlzLl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX18gLSBvdGhlci5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fXG4gICAgKTtcbiAgfVxufTtcblxuLy8gc3JjL2xpYi91dWlkLnRzXG52YXIgVXVpZCA9IGNsYXNzIF9VdWlkIHtcbiAgX191dWlkX187XG4gIC8qKlxuICAgKiBUaGUgbmlsIFVVSUQgKGFsbCB6ZXJvcykuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHRzXG4gICAqIGNvbnN0IHV1aWQgPSBVdWlkLk5JTDtcbiAgICogY29uc29sZS5hc3NlcnQoXG4gICAqICAgdXVpZC50b1N0cmluZygpID09PSBcIjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMFwiXG4gICAqICk7XG4gICAqIGBgYFxuICAgKi9cbiAgc3RhdGljIE5JTCA9IG5ldyBfVXVpZCgwbik7XG4gIHN0YXRpYyBNQVhfVVVJRF9CSUdJTlQgPSAweGZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmbjtcbiAgLyoqXG4gICAqIFRoZSBtYXggVVVJRCAoYWxsIG9uZXMpLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGB0c1xuICAgKiBjb25zdCB1dWlkID0gVXVpZC5NQVg7XG4gICAqIGNvbnNvbGUuYXNzZXJ0KFxuICAgKiAgIHV1aWQudG9TdHJpbmcoKSA9PT0gXCJmZmZmZmZmZi1mZmZmLWZmZmYtZmZmZi1mZmZmZmZmZmZmZmZcIlxuICAgKiApO1xuICAgKiBgYGBcbiAgICovXG4gIHN0YXRpYyBNQVggPSBuZXcgX1V1aWQoX1V1aWQuTUFYX1VVSURfQklHSU5UKTtcbiAgLyoqXG4gICAqIENyZWF0ZSBhIFVVSUQgZnJvbSBhIHJhdyAxMjgtYml0IHZhbHVlLlxuICAgKlxuICAgKiBAcGFyYW0gdSAtIFVuc2lnbmVkIDEyOC1iaXQgaW50ZWdlclxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIHZhbHVlIGlzIG91dHNpZGUgdGhlIHZhbGlkIFVVSUQgcmFuZ2VcbiAgICovXG4gIGNvbnN0cnVjdG9yKHUpIHtcbiAgICBjb25zdCB2ID0gY29lcmNlVG9CaWdJbnQodSwgXCJVdWlkXCIpO1xuICAgIGlmICh2IDwgMG4gfHwgdiA+IF9VdWlkLk1BWF9VVUlEX0JJR0lOVCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBVVUlEOiBtdXN0IGJlIGJldHdlZW4gMCBhbmQgYE1BWF9VVUlEX0JJR0lOVGBcIik7XG4gICAgfVxuICAgIHRoaXMuX191dWlkX18gPSB2O1xuICB9XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBVVUlEIGB2NGAgZnJvbSBleHBsaWNpdCByYW5kb20gYnl0ZXMuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGFzc3VtZXMgdGhlIGJ5dGVzIGFyZSBhbHJlYWR5IHN1ZmZpY2llbnRseSByYW5kb20uXG4gICAqIEl0IG9ubHkgc2V0cyB0aGUgYXBwcm9wcmlhdGUgYml0cyBmb3IgdGhlIFVVSUQgdmVyc2lvbiBhbmQgdmFyaWFudC5cbiAgICpcbiAgICogQHBhcmFtIGJ5dGVzIC0gRXhhY3RseSAxNiByYW5kb20gYnl0ZXNcbiAgICogQHJldHVybnMgQSBVVUlEIGB2NGBcbiAgICogQHRocm93cyB7RXJyb3J9IElmIGBieXRlcy5sZW5ndGggIT09IDE2YFxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGB0c1xuICAgKiBjb25zdCByYW5kb21CeXRlcyA9IG5ldyBVaW50OEFycmF5KDE2KTtcbiAgICogY29uc3QgdXVpZCA9IFV1aWQuZnJvbVJhbmRvbUJ5dGVzVjQocmFuZG9tQnl0ZXMpO1xuICAgKlxuICAgKiBjb25zb2xlLmFzc2VydChcbiAgICogICB1dWlkLnRvU3RyaW5nKCkgPT09IFwiMDAwMDAwMDAtMDAwMC00MDAwLTgwMDAtMDAwMDAwMDAwMDAwXCJcbiAgICogKTtcbiAgICogYGBgXG4gICAqL1xuICBzdGF0aWMgZnJvbVJhbmRvbUJ5dGVzVjQoYnl0ZXMpIHtcbiAgICBpZiAoYnl0ZXMubGVuZ3RoICE9PSAxNikgdGhyb3cgbmV3IEVycm9yKFwiVVVJRCB2NCByZXF1aXJlcyAxNiBieXRlc1wiKTtcbiAgICBjb25zdCBhcnIgPSBuZXcgVWludDhBcnJheShieXRlcyk7XG4gICAgYXJyWzZdID0gYXJyWzZdICYgMTUgfCA2NDtcbiAgICBhcnJbOF0gPSBhcnJbOF0gJiA2MyB8IDEyODtcbiAgICByZXR1cm4gbmV3IF9VdWlkKF9VdWlkLmJ5dGVzVG9CaWdJbnQoYXJyKSk7XG4gIH1cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgVVVJRCBgdjdgIHVzaW5nIGEgbW9ub3RvbmljIGNvdW50ZXIgZnJvbSBgMGAgdG8gYDJeMzEgLSAxYCxcbiAgICogYSB0aW1lc3RhbXAsIGFuZCA0IHJhbmRvbSBieXRlcy5cbiAgICpcbiAgICogVGhlIGNvdW50ZXIgd3JhcHMgYXJvdW5kIG9uIG92ZXJmbG93LlxuICAgKlxuICAgKiBUaGUgVVVJRCBgdjdgIGlzIHN0cnVjdHVyZWQgYXMgZm9sbG93czpcbiAgICpcbiAgICogYGBgYXNjaWlcbiAgICog4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSs4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4gICAqIHwgQjAgIHwgQjEgIHwgQjIgIHwgQjMgIHwgQjQgIHwgQjUgICAgICAgICAgICAgIHwgICAgICAgICBCNiAgICAgICAgfFxuICAgKiDilJzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilLzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilKRcbiAgICogfCAgICAgICAgICAgICAgICAgdW5peF90c19tcyAgICAgICAgICAgICAgICAgICAgfCAgICAgIHZlcnNpb24gNyAgICB8XG4gICAqIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUtOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuICAgKiDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilKzilIDilIDilIDilIDilIDilIDilIDilIDilIDilKzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilKzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbiAgICogfCBCNyAgICAgICAgICAgfCBCOCAgICAgIHwgQjkgIHwgQjEwIHwgQjExICB8IEIxMiB8IEIxMyB8IEIxNCB8IEIxNSB8XG4gICAqIOKUnOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUvOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUvOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUvOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUpFxuICAgKiB8IGNvdW50ZXJfaGlnaCB8IHZhcmlhbnQgfCAgICBjb3VudGVyX2xvdyAgIHwgICAgICAgIHJhbmRvbSAgICAgICAgIHxcbiAgICog4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS04pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS04pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS04pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gY291bnRlciAtIE11dGFibGUgbW9ub3RvbmljIGNvdW50ZXIgKDMxLWJpdClcbiAgICogQHBhcmFtIG5vdyAtIFRpbWVzdGFtcCBzaW5jZSB0aGUgVW5peCBlcG9jaFxuICAgKiBAcGFyYW0gcmFuZG9tQnl0ZXMgLSBFeGFjdGx5IDQgcmFuZG9tIGJ5dGVzXG4gICAqIEByZXR1cm5zIEEgVVVJRCBgdjdgXG4gICAqXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgYGNvdW50ZXJgIGlzIG5lZ2F0aXZlXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgYHRpbWVzdGFtcGAgaXMgYmVmb3JlIHRoZSBVbml4IGVwb2NoXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiBgcmFuZG9tQnl0ZXMubGVuZ3RoICE9PSA0YFxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGB0c1xuICAgKiBjb25zdCBub3cgPSBUaW1lc3RhbXAuZnJvbU1pbGxpcygxXzY4Nl8wMDBfMDAwXzAwMG4pO1xuICAgKiBjb25zdCBjb3VudGVyID0geyB2YWx1ZTogMSB9O1xuICAgKiBjb25zdCByYW5kb21CeXRlcyA9IG5ldyBVaW50OEFycmF5KDQpO1xuICAgKlxuICAgKiBjb25zdCB1dWlkID0gVXVpZC5mcm9tQ291bnRlclY3KGNvdW50ZXIsIG5vdywgcmFuZG9tQnl0ZXMpO1xuICAgKlxuICAgKiBjb25zb2xlLmFzc2VydChcbiAgICogICB1dWlkLnRvU3RyaW5nKCkgPT09IFwiMDAwMDY0N2UtNTE4MC03MDAwLTgwMDAtMDAwMjAwMDAwMDAwXCJcbiAgICogKTtcbiAgICogYGBgXG4gICAqL1xuICBzdGF0aWMgZnJvbUNvdW50ZXJWNyhjb3VudGVyLCBub3csIHJhbmRvbUJ5dGVzKSB7XG4gICAgaWYgKHJhbmRvbUJ5dGVzLmxlbmd0aCAhPT0gNCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYGZyb21Db3VudGVyVjdgIHJlcXVpcmVzIGByYW5kb21CeXRlcy5sZW5ndGggPT0gNGBcIik7XG4gICAgfVxuICAgIGlmIChjb3VudGVyLnZhbHVlIDwgMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYGZyb21Db3VudGVyVjdgIHV1aWQgYGNvdW50ZXJgIG11c3QgYmUgbm9uLW5lZ2F0aXZlXCIpO1xuICAgIH1cbiAgICBpZiAobm93Ll9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX18gPCAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJgZnJvbUNvdW50ZXJWN2AgYHRpbWVzdGFtcGAgYmVmb3JlIHVuaXggZXBvY2hcIik7XG4gICAgfVxuICAgIGNvbnN0IGNvdW50ZXJWYWwgPSBjb3VudGVyLnZhbHVlO1xuICAgIGNvdW50ZXIudmFsdWUgPSBjb3VudGVyVmFsICsgMSAmIDIxNDc0ODM2NDc7XG4gICAgY29uc3QgdHNNcyA9IG5vdy50b01pbGxpcygpICYgMHhmZmZmZmZmZmZmZmZuO1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoMTYpO1xuICAgIGJ5dGVzWzBdID0gTnVtYmVyKHRzTXMgPj4gNDBuICYgMHhmZm4pO1xuICAgIGJ5dGVzWzFdID0gTnVtYmVyKHRzTXMgPj4gMzJuICYgMHhmZm4pO1xuICAgIGJ5dGVzWzJdID0gTnVtYmVyKHRzTXMgPj4gMjRuICYgMHhmZm4pO1xuICAgIGJ5dGVzWzNdID0gTnVtYmVyKHRzTXMgPj4gMTZuICYgMHhmZm4pO1xuICAgIGJ5dGVzWzRdID0gTnVtYmVyKHRzTXMgPj4gOG4gJiAweGZmbik7XG4gICAgYnl0ZXNbNV0gPSBOdW1iZXIodHNNcyAmIDB4ZmZuKTtcbiAgICBieXRlc1s3XSA9IGNvdW50ZXJWYWwgPj4+IDIzICYgMjU1O1xuICAgIGJ5dGVzWzldID0gY291bnRlclZhbCA+Pj4gMTUgJiAyNTU7XG4gICAgYnl0ZXNbMTBdID0gY291bnRlclZhbCA+Pj4gNyAmIDI1NTtcbiAgICBieXRlc1sxMV0gPSAoY291bnRlclZhbCAmIDEyNykgPDwgMSAmIDI1NTtcbiAgICBieXRlc1sxMl0gfD0gcmFuZG9tQnl0ZXNbMF0gJiAxMjc7XG4gICAgYnl0ZXNbMTNdID0gcmFuZG9tQnl0ZXNbMV07XG4gICAgYnl0ZXNbMTRdID0gcmFuZG9tQnl0ZXNbMl07XG4gICAgYnl0ZXNbMTVdID0gcmFuZG9tQnl0ZXNbM107XG4gICAgYnl0ZXNbNl0gPSBieXRlc1s2XSAmIDE1IHwgMTEyO1xuICAgIGJ5dGVzWzhdID0gYnl0ZXNbOF0gJiA2MyB8IDEyODtcbiAgICByZXR1cm4gbmV3IF9VdWlkKF9VdWlkLmJ5dGVzVG9CaWdJbnQoYnl0ZXMpKTtcbiAgfVxuICAvKipcbiAgICogUGFyc2UgYSBVVUlEIGZyb20gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSBzIC0gVVVJRCBzdHJpbmdcbiAgICogQHJldHVybnMgUGFyc2VkIFVVSURcbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBzdHJpbmcgaXMgbm90IGEgdmFsaWQgVVVJRFxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGB0c1xuICAgKiBjb25zdCBzID0gXCIwMTg4OGQ2ZS01YzAwLTcwMDAtODAwMC0wMDAwMDAwMDAwMDBcIjtcbiAgICogY29uc3QgdXVpZCA9IFV1aWQucGFyc2Uocyk7XG4gICAqXG4gICAqIGNvbnNvbGUuYXNzZXJ0KHV1aWQudG9TdHJpbmcoKSA9PT0gcyk7XG4gICAqIGBgYFxuICAgKi9cbiAgc3RhdGljIHBhcnNlKHMpIHtcbiAgICBjb25zdCBoZXggPSBzLnJlcGxhY2UoLy0vZywgXCJcIik7XG4gICAgaWYgKGhleC5sZW5ndGggIT09IDMyKSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGhleCBVVUlEXCIpO1xuICAgIGxldCB2ID0gMG47XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzMjsgaSArPSAyKSB7XG4gICAgICB2ID0gdiA8PCA4biB8IEJpZ0ludChwYXJzZUludChoZXguc2xpY2UoaSwgaSArIDIpLCAxNikpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IF9VdWlkKHYpO1xuICB9XG4gIC8qKiBDb252ZXJ0IHRvIGhleCBzdHJpbmcgd2l0aG91dCBhIDB4IHByZWZpeC4gKi9cbiAgdG9IZXhTdHJpbmcoKSB7XG4gICAgcmV0dXJuIHUxMjhUb0hleFN0cmluZyh0aGlzLmFzQmlnSW50KCkpO1xuICB9XG4gIC8qKiBDb252ZXJ0IHRvIHN0cmluZyAoaHlwaGVuYXRlZCBmb3JtKS4gKi9cbiAgdG9TdHJpbmcoKSB7XG4gICAgY29uc3QgaGV4ID0gdGhpcy50b0hleFN0cmluZygpO1xuICAgIHJldHVybiBoZXguc2xpY2UoMCwgOCkgKyBcIi1cIiArIGhleC5zbGljZSg4LCAxMikgKyBcIi1cIiArIGhleC5zbGljZSgxMiwgMTYpICsgXCItXCIgKyBoZXguc2xpY2UoMTYsIDIwKSArIFwiLVwiICsgaGV4LnNsaWNlKDIwKTtcbiAgfVxuICAvKiogQ29udmVydCB0byBiaWdpbnQgKHUxMjgpLiAqL1xuICBhc0JpZ0ludCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3V1aWRfXztcbiAgfVxuICAvKiogUmV0dXJuIGEgYFVpbnQ4QXJyYXlgIG9mIDE2IGJ5dGVzLiAqL1xuICB0b0J5dGVzKCkge1xuICAgIHJldHVybiBfVXVpZC5iaWdJbnRUb0J5dGVzKHRoaXMuX191dWlkX18pO1xuICB9XG4gIHN0YXRpYyBieXRlc1RvQmlnSW50KGJ5dGVzKSB7XG4gICAgbGV0IHJlc3VsdCA9IDBuO1xuICAgIGZvciAoY29uc3QgYiBvZiBieXRlcykgcmVzdWx0ID0gcmVzdWx0IDw8IDhuIHwgQmlnSW50KGIpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgc3RhdGljIGJpZ0ludFRvQnl0ZXModmFsdWUpIHtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KDE2KTtcbiAgICBmb3IgKGxldCBpID0gMTU7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBieXRlc1tpXSA9IE51bWJlcih2YWx1ZSAmIDB4ZmZuKTtcbiAgICAgIHZhbHVlID4+PSA4bjtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGVzO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2ZXJzaW9uIG9mIHRoaXMgVVVJRC5cbiAgICpcbiAgICogVGhpcyByZXByZXNlbnRzIHRoZSBhbGdvcml0aG0gdXNlZCB0byBnZW5lcmF0ZSB0aGUgdmFsdWUuXG4gICAqXG4gICAqIEByZXR1cm5zIEEgYFV1aWRWZXJzaW9uYFxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIHZlcnNpb24gZmllbGQgaXMgbm90IHJlY29nbml6ZWRcbiAgICovXG4gIGdldFZlcnNpb24oKSB7XG4gICAgY29uc3QgdmVyc2lvbiA9IHRoaXMudG9CeXRlcygpWzZdID4+IDQgJiAxNTtcbiAgICBzd2l0Y2ggKHZlcnNpb24pIHtcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgcmV0dXJuIFwiVjRcIjtcbiAgICAgIGNhc2UgNzpcbiAgICAgICAgcmV0dXJuIFwiVjdcIjtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmICh0aGlzID09IF9VdWlkLk5JTCkge1xuICAgICAgICAgIHJldHVybiBcIk5pbFwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzID09IF9VdWlkLk1BWCkge1xuICAgICAgICAgIHJldHVybiBcIk1heFwiO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgVVVJRCB2ZXJzaW9uOiAke3ZlcnNpb259YCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBFeHRyYWN0IHRoZSBtb25vdG9uaWMgY291bnRlciBmcm9tIGEgVVVJRHY3LlxuICAgKlxuICAgKiBJbnRlbmRlZCBmb3IgdGVzdGluZyBhbmQgZGlhZ25vc3RpY3MuXG4gICAqIEJlaGF2aW9yIGlzIHVuZGVmaW5lZCBpZiBjYWxsZWQgb24gYSBub24tVjcgVVVJRC5cbiAgICpcbiAgICogQHJldHVybnMgMzEtYml0IGNvdW50ZXIgdmFsdWVcbiAgICovXG4gIGdldENvdW50ZXIoKSB7XG4gICAgY29uc3QgYnl0ZXMgPSB0aGlzLnRvQnl0ZXMoKTtcbiAgICBjb25zdCBoaWdoID0gYnl0ZXNbN107XG4gICAgY29uc3QgbWlkMSA9IGJ5dGVzWzldO1xuICAgIGNvbnN0IG1pZDIgPSBieXRlc1sxMF07XG4gICAgY29uc3QgbG93ID0gYnl0ZXNbMTFdID4+PiAxO1xuICAgIHJldHVybiBoaWdoIDw8IDIzIHwgbWlkMSA8PCAxNSB8IG1pZDIgPDwgNyB8IGxvdyB8IDA7XG4gIH1cbiAgY29tcGFyZVRvKG90aGVyKSB7XG4gICAgaWYgKHRoaXMuX191dWlkX18gPCBvdGhlci5fX3V1aWRfXykgcmV0dXJuIC0xO1xuICAgIGlmICh0aGlzLl9fdXVpZF9fID4gb3RoZXIuX191dWlkX18pIHJldHVybiAxO1xuICAgIHJldHVybiAwO1xuICB9XG4gIHN0YXRpYyBnZXRBbGdlYnJhaWNUeXBlKCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLlByb2R1Y3Qoe1xuICAgICAgZWxlbWVudHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6IFwiX191dWlkX19cIixcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLlUxMjhcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pO1xuICB9XG59O1xuXG4vLyBzcmMvbGliL2Nvbm5lY3Rpb25faWQudHNcbnZhciBDb25uZWN0aW9uSWQgPSBjbGFzcyBfQ29ubmVjdGlvbklkIHtcbiAgX19jb25uZWN0aW9uX2lkX187XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBDb25uZWN0aW9uSWRgLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZGF0YSkge1xuICAgIHRoaXMuX19jb25uZWN0aW9uX2lkX18gPSBjb2VyY2VUb0JpZ0ludChkYXRhLCBcIkNvbm5lY3Rpb25JZFwiKTtcbiAgfVxuICAvKipcbiAgICogR2V0IHRoZSBhbGdlYnJhaWMgdHlwZSByZXByZXNlbnRhdGlvbiBvZiB0aGUge0BsaW5rIENvbm5lY3Rpb25JZH0gdHlwZS5cbiAgICogQHJldHVybnMgVGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0eXBlLlxuICAgKi9cbiAgc3RhdGljIGdldEFsZ2VicmFpY1R5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7XG4gICAgICBlbGVtZW50czogW1xuICAgICAgICB7IG5hbWU6IFwiX19jb25uZWN0aW9uX2lkX19cIiwgYWxnZWJyYWljVHlwZTogQWxnZWJyYWljVHlwZS5VMTI4IH1cbiAgICAgIF1cbiAgICB9KTtcbiAgfVxuICBpc1plcm8oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19jb25uZWN0aW9uX2lkX18gPT09IEJpZ0ludCgwKTtcbiAgfVxuICBzdGF0aWMgbnVsbElmWmVybyhhZGRyKSB7XG4gICAgaWYgKGFkZHIuaXNaZXJvKCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYWRkcjtcbiAgICB9XG4gIH1cbiAgc3RhdGljIHJhbmRvbSgpIHtcbiAgICBmdW5jdGlvbiByYW5kb21VOCgpIHtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNTUpO1xuICAgIH1cbiAgICBsZXQgcmVzdWx0ID0gQmlnSW50KDApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTY7IGkrKykge1xuICAgICAgcmVzdWx0ID0gcmVzdWx0IDw8IEJpZ0ludCg4KSB8IEJpZ0ludChyYW5kb21VOCgpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBfQ29ubmVjdGlvbklkKHJlc3VsdCk7XG4gIH1cbiAgLyoqXG4gICAqIENvbXBhcmUgdHdvIGNvbm5lY3Rpb24gSURzIGZvciBlcXVhbGl0eS5cbiAgICovXG4gIGlzRXF1YWwob3RoZXIpIHtcbiAgICByZXR1cm4gdGhpcy5fX2Nvbm5lY3Rpb25faWRfXyA9PSBvdGhlci5fX2Nvbm5lY3Rpb25faWRfXztcbiAgfVxuICAvKipcbiAgICogQ2hlY2sgaWYgdHdvIGNvbm5lY3Rpb24gSURzIGFyZSBlcXVhbC5cbiAgICovXG4gIGVxdWFscyhvdGhlcikge1xuICAgIHJldHVybiB0aGlzLmlzRXF1YWwob3RoZXIpO1xuICB9XG4gIC8qKlxuICAgKiBQcmludCB0aGUgY29ubmVjdGlvbiBJRCBhcyBhIGhleGFkZWNpbWFsIHN0cmluZy5cbiAgICovXG4gIHRvSGV4U3RyaW5nKCkge1xuICAgIHJldHVybiB1MTI4VG9IZXhTdHJpbmcodGhpcy5fX2Nvbm5lY3Rpb25faWRfXyk7XG4gIH1cbiAgLyoqXG4gICAqIENvbnZlcnQgdGhlIGNvbm5lY3Rpb24gSUQgdG8gYSBVaW50OEFycmF5LlxuICAgKi9cbiAgdG9VaW50OEFycmF5KCkge1xuICAgIHJldHVybiB1MTI4VG9VaW50OEFycmF5KHRoaXMuX19jb25uZWN0aW9uX2lkX18pO1xuICB9XG4gIC8qKlxuICAgKiBQYXJzZSBhIGNvbm5lY3Rpb24gSUQgZnJvbSBhIGhleGFkZWNpbWFsIHN0cmluZy5cbiAgICovXG4gIHN0YXRpYyBmcm9tU3RyaW5nKHN0cikge1xuICAgIHJldHVybiBuZXcgX0Nvbm5lY3Rpb25JZChoZXhTdHJpbmdUb1UxMjgoc3RyKSk7XG4gIH1cbiAgc3RhdGljIGZyb21TdHJpbmdPck51bGwoc3RyKSB7XG4gICAgY29uc3QgYWRkciA9IF9Db25uZWN0aW9uSWQuZnJvbVN0cmluZyhzdHIpO1xuICAgIGlmIChhZGRyLmlzWmVybygpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGFkZHI7XG4gICAgfVxuICB9XG59O1xuXG4vLyBzcmMvbGliL2lkZW50aXR5LnRzXG52YXIgSWRlbnRpdHkgPSBjbGFzcyBfSWRlbnRpdHkge1xuICBfX2lkZW50aXR5X187XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBJZGVudGl0eWAuXG4gICAqXG4gICAqIGBkYXRhYCBjYW4gYmUgYSBoZXhhZGVjaW1hbCBzdHJpbmcgb3IgYSBgYmlnaW50YC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICB0aGlzLl9faWRlbnRpdHlfXyA9IHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiID8gaGV4U3RyaW5nVG9VMjU2KGRhdGEpIDogY29lcmNlVG9CaWdJbnQoZGF0YSwgXCJJZGVudGl0eVwiKTtcbiAgfVxuICAvKipcbiAgICogR2V0IHRoZSBhbGdlYnJhaWMgdHlwZSByZXByZXNlbnRhdGlvbiBvZiB0aGUge0BsaW5rIElkZW50aXR5fSB0eXBlLlxuICAgKiBAcmV0dXJucyBUaGUgYWxnZWJyYWljIHR5cGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHR5cGUuXG4gICAqL1xuICBzdGF0aWMgZ2V0QWxnZWJyYWljVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHtcbiAgICAgIGVsZW1lbnRzOiBbeyBuYW1lOiBcIl9faWRlbnRpdHlfX1wiLCBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLlUyNTYgfV1cbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICogQ2hlY2sgaWYgdHdvIGlkZW50aXRpZXMgYXJlIGVxdWFsLlxuICAgKi9cbiAgaXNFcXVhbChvdGhlcikge1xuICAgIHJldHVybiB0aGlzLnRvSGV4U3RyaW5nKCkgPT09IG90aGVyLnRvSGV4U3RyaW5nKCk7XG4gIH1cbiAgLyoqXG4gICAqIENoZWNrIGlmIHR3byBpZGVudGl0aWVzIGFyZSBlcXVhbC5cbiAgICovXG4gIGVxdWFscyhvdGhlcikge1xuICAgIHJldHVybiB0aGlzLmlzRXF1YWwob3RoZXIpO1xuICB9XG4gIC8qKlxuICAgKiBQcmludCB0aGUgaWRlbnRpdHkgYXMgYSBoZXhhZGVjaW1hbCBzdHJpbmcuXG4gICAqL1xuICB0b0hleFN0cmluZygpIHtcbiAgICByZXR1cm4gdTI1NlRvSGV4U3RyaW5nKHRoaXMuX19pZGVudGl0eV9fKTtcbiAgfVxuICAvKipcbiAgICogQ29udmVydCB0aGUgYWRkcmVzcyB0byBhIFVpbnQ4QXJyYXkuXG4gICAqL1xuICB0b1VpbnQ4QXJyYXkoKSB7XG4gICAgcmV0dXJuIHUyNTZUb1VpbnQ4QXJyYXkodGhpcy5fX2lkZW50aXR5X18pO1xuICB9XG4gIC8qKlxuICAgKiBQYXJzZSBhbiBJZGVudGl0eSBmcm9tIGEgaGV4YWRlY2ltYWwgc3RyaW5nLlxuICAgKi9cbiAgc3RhdGljIGZyb21TdHJpbmcoc3RyKSB7XG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHkoc3RyKTtcbiAgfVxuICAvKipcbiAgICogWmVybyBpZGVudGl0eSAoMHgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwKVxuICAgKi9cbiAgc3RhdGljIHplcm8oKSB7XG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHkoMG4pO1xuICB9XG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLnRvSGV4U3RyaW5nKCk7XG4gIH1cbn07XG5cbi8vIHNyYy9saWIvYWxnZWJyYWljX3R5cGUudHNcbnZhciBTRVJJQUxJWkVSUyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG52YXIgREVTRVJJQUxJWkVSUyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG52YXIgQWxnZWJyYWljVHlwZSA9IHtcbiAgUmVmOiAodmFsdWUpID0+ICh7IHRhZzogXCJSZWZcIiwgdmFsdWUgfSksXG4gIFN1bTogKHZhbHVlKSA9PiAoe1xuICAgIHRhZzogXCJTdW1cIixcbiAgICB2YWx1ZVxuICB9KSxcbiAgUHJvZHVjdDogKHZhbHVlKSA9PiAoe1xuICAgIHRhZzogXCJQcm9kdWN0XCIsXG4gICAgdmFsdWVcbiAgfSksXG4gIEFycmF5OiAodmFsdWUpID0+ICh7XG4gICAgdGFnOiBcIkFycmF5XCIsXG4gICAgdmFsdWVcbiAgfSksXG4gIFN0cmluZzogeyB0YWc6IFwiU3RyaW5nXCIgfSxcbiAgQm9vbDogeyB0YWc6IFwiQm9vbFwiIH0sXG4gIEk4OiB7IHRhZzogXCJJOFwiIH0sXG4gIFU4OiB7IHRhZzogXCJVOFwiIH0sXG4gIEkxNjogeyB0YWc6IFwiSTE2XCIgfSxcbiAgVTE2OiB7IHRhZzogXCJVMTZcIiB9LFxuICBJMzI6IHsgdGFnOiBcIkkzMlwiIH0sXG4gIFUzMjogeyB0YWc6IFwiVTMyXCIgfSxcbiAgSTY0OiB7IHRhZzogXCJJNjRcIiB9LFxuICBVNjQ6IHsgdGFnOiBcIlU2NFwiIH0sXG4gIEkxMjg6IHsgdGFnOiBcIkkxMjhcIiB9LFxuICBVMTI4OiB7IHRhZzogXCJVMTI4XCIgfSxcbiAgSTI1NjogeyB0YWc6IFwiSTI1NlwiIH0sXG4gIFUyNTY6IHsgdGFnOiBcIlUyNTZcIiB9LFxuICBGMzI6IHsgdGFnOiBcIkYzMlwiIH0sXG4gIEY2NDogeyB0YWc6IFwiRjY0XCIgfSxcbiAgbWFrZVNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkge1xuICAgIGlmICh0eS50YWcgPT09IFwiUmVmXCIpIHtcbiAgICAgIGlmICghdHlwZXNwYWNlKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYW5ub3Qgc2VyaWFsaXplIHJlZnMgd2l0aG91dCBhIHR5cGVzcGFjZVwiKTtcbiAgICAgIHdoaWxlICh0eS50YWcgPT09IFwiUmVmXCIpIHR5ID0gdHlwZXNwYWNlLnR5cGVzW3R5LnZhbHVlXTtcbiAgICB9XG4gICAgc3dpdGNoICh0eS50YWcpIHtcbiAgICAgIGNhc2UgXCJQcm9kdWN0XCI6XG4gICAgICAgIHJldHVybiBQcm9kdWN0VHlwZS5tYWtlU2VyaWFsaXplcih0eS52YWx1ZSwgdHlwZXNwYWNlKTtcbiAgICAgIGNhc2UgXCJTdW1cIjpcbiAgICAgICAgcmV0dXJuIFN1bVR5cGUubWFrZVNlcmlhbGl6ZXIodHkudmFsdWUsIHR5cGVzcGFjZSk7XG4gICAgICBjYXNlIFwiQXJyYXlcIjpcbiAgICAgICAgaWYgKHR5LnZhbHVlLnRhZyA9PT0gXCJVOFwiKSB7XG4gICAgICAgICAgcmV0dXJuIHNlcmlhbGl6ZVVpbnQ4QXJyYXk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3Qgc2VyaWFsaXplID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcih0eS52YWx1ZSwgdHlwZXNwYWNlKTtcbiAgICAgICAgICByZXR1cm4gKHdyaXRlciwgdmFsdWUpID0+IHtcbiAgICAgICAgICAgIHdyaXRlci53cml0ZVUzMih2YWx1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBlbGVtIG9mIHZhbHVlKSB7XG4gICAgICAgICAgICAgIHNlcmlhbGl6ZSh3cml0ZXIsIGVsZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBwcmltaXRpdmVTZXJpYWxpemVyc1t0eS50YWddO1xuICAgIH1cbiAgfSxcbiAgLyoqIEBkZXByZWNhdGVkIFVzZSBgbWFrZVNlcmlhbGl6ZXJgIGluc3RlYWQuICovXG4gIHNlcmlhbGl6ZVZhbHVlKHdyaXRlciwgdHksIHZhbHVlLCB0eXBlc3BhY2UpIHtcbiAgICBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpKHdyaXRlciwgdmFsdWUpO1xuICB9LFxuICBtYWtlRGVzZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpIHtcbiAgICBpZiAodHkudGFnID09PSBcIlJlZlwiKSB7XG4gICAgICBpZiAoIXR5cGVzcGFjZSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2Fubm90IGRlc2VyaWFsaXplIHJlZnMgd2l0aG91dCBhIHR5cGVzcGFjZVwiKTtcbiAgICAgIHdoaWxlICh0eS50YWcgPT09IFwiUmVmXCIpIHR5ID0gdHlwZXNwYWNlLnR5cGVzW3R5LnZhbHVlXTtcbiAgICB9XG4gICAgc3dpdGNoICh0eS50YWcpIHtcbiAgICAgIGNhc2UgXCJQcm9kdWN0XCI6XG4gICAgICAgIHJldHVybiBQcm9kdWN0VHlwZS5tYWtlRGVzZXJpYWxpemVyKHR5LnZhbHVlLCB0eXBlc3BhY2UpO1xuICAgICAgY2FzZSBcIlN1bVwiOlxuICAgICAgICByZXR1cm4gU3VtVHlwZS5tYWtlRGVzZXJpYWxpemVyKHR5LnZhbHVlLCB0eXBlc3BhY2UpO1xuICAgICAgY2FzZSBcIkFycmF5XCI6XG4gICAgICAgIGlmICh0eS52YWx1ZS50YWcgPT09IFwiVThcIikge1xuICAgICAgICAgIHJldHVybiBkZXNlcmlhbGl6ZVVpbnQ4QXJyYXk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZGVzZXJpYWxpemUgPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoXG4gICAgICAgICAgICB0eS52YWx1ZSxcbiAgICAgICAgICAgIHR5cGVzcGFjZVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIChyZWFkZXIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IHJlYWRlci5yZWFkVTMyKCk7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICByZXN1bHRbaV0gPSBkZXNlcmlhbGl6ZShyZWFkZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gcHJpbWl0aXZlRGVzZXJpYWxpemVyc1t0eS50YWddO1xuICAgIH1cbiAgfSxcbiAgLyoqIEBkZXByZWNhdGVkIFVzZSBgbWFrZURlc2VyaWFsaXplcmAgaW5zdGVhZC4gKi9cbiAgZGVzZXJpYWxpemVWYWx1ZShyZWFkZXIsIHR5LCB0eXBlc3BhY2UpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpKHJlYWRlcik7XG4gIH0sXG4gIC8qKlxuICAgKiBDb252ZXJ0IGEgdmFsdWUgb2YgdGhlIGFsZ2VicmFpYyB0eXBlIGludG8gc29tZXRoaW5nIHRoYXQgY2FuIGJlIHVzZWQgYXMgYSBrZXkgaW4gYSBtYXAuXG4gICAqIFRoZXJlIGFyZSBubyBndWFyYW50ZWVzIGFib3V0IGJlaW5nIGFibGUgdG8gb3JkZXIgaXQuXG4gICAqIFRoaXMgaXMgb25seSBndWFyYW50ZWVkIHRvIGJlIGNvbXBhcmFibGUgdG8gb3RoZXIgdmFsdWVzIG9mIHRoZSBzYW1lIHR5cGUuXG4gICAqIEBwYXJhbSB2YWx1ZSBBIHZhbHVlIG9mIHRoZSBhbGdlYnJhaWMgdHlwZVxuICAgKiBAcmV0dXJucyBTb21ldGhpbmcgdGhhdCBjYW4gYmUgdXNlZCBhcyBhIGtleSBpbiBhIG1hcC5cbiAgICovXG4gIGludG9NYXBLZXk6IGZ1bmN0aW9uKHR5LCB2YWx1ZSkge1xuICAgIHN3aXRjaCAodHkudGFnKSB7XG4gICAgICBjYXNlIFwiVThcIjpcbiAgICAgIGNhc2UgXCJVMTZcIjpcbiAgICAgIGNhc2UgXCJVMzJcIjpcbiAgICAgIGNhc2UgXCJVNjRcIjpcbiAgICAgIGNhc2UgXCJVMTI4XCI6XG4gICAgICBjYXNlIFwiVTI1NlwiOlxuICAgICAgY2FzZSBcIkk4XCI6XG4gICAgICBjYXNlIFwiSTE2XCI6XG4gICAgICBjYXNlIFwiSTMyXCI6XG4gICAgICBjYXNlIFwiSTY0XCI6XG4gICAgICBjYXNlIFwiSTEyOFwiOlxuICAgICAgY2FzZSBcIkkyNTZcIjpcbiAgICAgIGNhc2UgXCJGMzJcIjpcbiAgICAgIGNhc2UgXCJGNjRcIjpcbiAgICAgIGNhc2UgXCJTdHJpbmdcIjpcbiAgICAgIGNhc2UgXCJCb29sXCI6XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIGNhc2UgXCJQcm9kdWN0XCI6XG4gICAgICAgIHJldHVybiBQcm9kdWN0VHlwZS5pbnRvTWFwS2V5KHR5LnZhbHVlLCB2YWx1ZSk7XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIGNvbnN0IHdyaXRlciA9IG5ldyBCaW5hcnlXcml0ZXIoMTApO1xuICAgICAgICBBbGdlYnJhaWNUeXBlLnNlcmlhbGl6ZVZhbHVlKHdyaXRlciwgdHksIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHdyaXRlci50b0Jhc2U2NCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcbmZ1bmN0aW9uIGJpbmRDYWxsKGYpIHtcbiAgcmV0dXJuIEZ1bmN0aW9uLnByb3RvdHlwZS5jYWxsLmJpbmQoZik7XG59XG52YXIgcHJpbWl0aXZlU2VyaWFsaXplcnMgPSB7XG4gIEJvb2w6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVCb29sKSxcbiAgSTg6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVJOCksXG4gIFU4OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlVTgpLFxuICBJMTY6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVJMTYpLFxuICBVMTY6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVMTYpLFxuICBJMzI6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVJMzIpLFxuICBVMzI6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVMzIpLFxuICBJNjQ6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVJNjQpLFxuICBVNjQ6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVNjQpLFxuICBJMTI4OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlSTEyOCksXG4gIFUxMjg6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVMTI4KSxcbiAgSTI1NjogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUkyNTYpLFxuICBVMjU2OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlVTI1NiksXG4gIEYzMjogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUYzMiksXG4gIEY2NDogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUY2NCksXG4gIFN0cmluZzogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZVN0cmluZylcbn07XG5PYmplY3QuZnJlZXplKHByaW1pdGl2ZVNlcmlhbGl6ZXJzKTtcbnZhciBzZXJpYWxpemVVaW50OEFycmF5ID0gYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZVVJbnQ4QXJyYXkpO1xudmFyIHByaW1pdGl2ZURlc2VyaWFsaXplcnMgPSB7XG4gIEJvb2w6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEJvb2wpLFxuICBJODogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkSTgpLFxuICBVODogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkVTgpLFxuICBJMTY6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEkxNiksXG4gIFUxNjogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkVTE2KSxcbiAgSTMyOiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRJMzIpLFxuICBVMzI6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZFUzMiksXG4gIEk2NDogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkSTY0KSxcbiAgVTY0OiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRVNjQpLFxuICBJMTI4OiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRJMTI4KSxcbiAgVTEyODogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkVTEyOCksXG4gIEkyNTY6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEkyNTYpLFxuICBVMjU2OiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRVMjU2KSxcbiAgRjMyOiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRGMzIpLFxuICBGNjQ6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEY2NCksXG4gIFN0cmluZzogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkU3RyaW5nKVxufTtcbk9iamVjdC5mcmVlemUocHJpbWl0aXZlRGVzZXJpYWxpemVycyk7XG52YXIgZGVzZXJpYWxpemVVaW50OEFycmF5ID0gYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkVUludDhBcnJheSk7XG52YXIgcHJpbWl0aXZlU2l6ZXMgPSB7XG4gIEJvb2w6IDEsXG4gIEk4OiAxLFxuICBVODogMSxcbiAgSTE2OiAyLFxuICBVMTY6IDIsXG4gIEkzMjogNCxcbiAgVTMyOiA0LFxuICBJNjQ6IDgsXG4gIFU2NDogOCxcbiAgSTEyODogMTYsXG4gIFUxMjg6IDE2LFxuICBJMjU2OiAzMixcbiAgVTI1NjogMzIsXG4gIEYzMjogNCxcbiAgRjY0OiA4XG59O1xudmFyIGZpeGVkU2l6ZVByaW1pdGl2ZXMgPSBuZXcgU2V0KE9iamVjdC5rZXlzKHByaW1pdGl2ZVNpemVzKSk7XG52YXIgaXNGaXhlZFNpemVQcm9kdWN0ID0gKHR5KSA9PiB0eS5lbGVtZW50cy5ldmVyeShcbiAgKHsgYWxnZWJyYWljVHlwZSB9KSA9PiBmaXhlZFNpemVQcmltaXRpdmVzLmhhcyhhbGdlYnJhaWNUeXBlLnRhZylcbik7XG52YXIgcHJvZHVjdFNpemUgPSAodHkpID0+IHR5LmVsZW1lbnRzLnJlZHVjZShcbiAgKGFjYywgeyBhbGdlYnJhaWNUeXBlIH0pID0+IGFjYyArIHByaW1pdGl2ZVNpemVzW2FsZ2VicmFpY1R5cGUudGFnXSxcbiAgMFxuKTtcbnZhciBwcmltaXRpdmVKU05hbWUgPSB7XG4gIEJvb2w6IFwiVWludDhcIixcbiAgSTg6IFwiSW50OFwiLFxuICBVODogXCJVaW50OFwiLFxuICBJMTY6IFwiSW50MTZcIixcbiAgVTE2OiBcIlVpbnQxNlwiLFxuICBJMzI6IFwiSW50MzJcIixcbiAgVTMyOiBcIlVpbnQzMlwiLFxuICBJNjQ6IFwiQmlnSW50NjRcIixcbiAgVTY0OiBcIkJpZ1VpbnQ2NFwiLFxuICBGMzI6IFwiRmxvYXQzMlwiLFxuICBGNjQ6IFwiRmxvYXQ2NFwiXG59O1xudmFyIHNwZWNpYWxQcm9kdWN0RGVzZXJpYWxpemVycyA9IHtcbiAgX190aW1lX2R1cmF0aW9uX21pY3Jvc19fOiAocmVhZGVyKSA9PiBuZXcgVGltZUR1cmF0aW9uKHJlYWRlci5yZWFkSTY0KCkpLFxuICBfX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fOiAocmVhZGVyKSA9PiBuZXcgVGltZXN0YW1wKHJlYWRlci5yZWFkSTY0KCkpLFxuICBfX2lkZW50aXR5X186IChyZWFkZXIpID0+IG5ldyBJZGVudGl0eShyZWFkZXIucmVhZFUyNTYoKSksXG4gIF9fY29ubmVjdGlvbl9pZF9fOiAocmVhZGVyKSA9PiBuZXcgQ29ubmVjdGlvbklkKHJlYWRlci5yZWFkVTEyOCgpKSxcbiAgX191dWlkX186IChyZWFkZXIpID0+IG5ldyBVdWlkKHJlYWRlci5yZWFkVTEyOCgpKVxufTtcbk9iamVjdC5mcmVlemUoc3BlY2lhbFByb2R1Y3REZXNlcmlhbGl6ZXJzKTtcbnZhciB1bml0RGVzZXJpYWxpemVyID0gKCkgPT4gKHt9KTtcbnZhciBnZXRFbGVtZW50SW5pdGlhbGl6ZXIgPSAoZWxlbWVudCkgPT4ge1xuICBsZXQgaW5pdDtcbiAgc3dpdGNoIChlbGVtZW50LmFsZ2VicmFpY1R5cGUudGFnKSB7XG4gICAgY2FzZSBcIlN0cmluZ1wiOlxuICAgICAgaW5pdCA9IFwiJydcIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJCb29sXCI6XG4gICAgICBpbml0ID0gXCJmYWxzZVwiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIkk4XCI6XG4gICAgY2FzZSBcIlU4XCI6XG4gICAgY2FzZSBcIkkxNlwiOlxuICAgIGNhc2UgXCJVMTZcIjpcbiAgICBjYXNlIFwiSTMyXCI6XG4gICAgY2FzZSBcIlUzMlwiOlxuICAgICAgaW5pdCA9IFwiMFwiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIkk2NFwiOlxuICAgIGNhc2UgXCJVNjRcIjpcbiAgICBjYXNlIFwiSTEyOFwiOlxuICAgIGNhc2UgXCJVMTI4XCI6XG4gICAgY2FzZSBcIkkyNTZcIjpcbiAgICBjYXNlIFwiVTI1NlwiOlxuICAgICAgaW5pdCA9IFwiMG5cIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJGMzJcIjpcbiAgICBjYXNlIFwiRjY0XCI6XG4gICAgICBpbml0ID0gXCIwLjBcIjtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBpbml0ID0gXCJ1bmRlZmluZWRcIjtcbiAgfVxuICByZXR1cm4gYCR7ZWxlbWVudC5uYW1lfTogJHtpbml0fWA7XG59O1xudmFyIFByb2R1Y3RUeXBlID0ge1xuICBtYWtlU2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSB7XG4gICAgbGV0IHNlcmlhbGl6ZXIgPSBTRVJJQUxJWkVSUy5nZXQodHkpO1xuICAgIGlmIChzZXJpYWxpemVyICE9IG51bGwpIHJldHVybiBzZXJpYWxpemVyO1xuICAgIGlmIChpc0ZpeGVkU2l6ZVByb2R1Y3QodHkpKSB7XG4gICAgICBjb25zdCBzaXplID0gcHJvZHVjdFNpemUodHkpO1xuICAgICAgY29uc3QgYm9keTIgPSBgXCJ1c2Ugc3RyaWN0XCI7XG53cml0ZXIuZXhwYW5kQnVmZmVyKCR7c2l6ZX0pO1xuY29uc3QgdmlldyA9IHdyaXRlci52aWV3O1xuJHt0eS5lbGVtZW50cy5tYXAoXG4gICAgICAgICh7IG5hbWUsIGFsZ2VicmFpY1R5cGU6IHsgdGFnIH0gfSkgPT4gdGFnIGluIHByaW1pdGl2ZUpTTmFtZSA/IGB2aWV3LnNldCR7cHJpbWl0aXZlSlNOYW1lW3RhZ119KHdyaXRlci5vZmZzZXQsIHZhbHVlLiR7bmFtZX0sICR7cHJpbWl0aXZlU2l6ZXNbdGFnXSA+IDEgPyBcInRydWVcIiA6IFwiXCJ9KTtcbndyaXRlci5vZmZzZXQgKz0gJHtwcmltaXRpdmVTaXplc1t0YWddfTtgIDogYHdyaXRlci53cml0ZSR7dGFnfSh2YWx1ZS4ke25hbWV9KTtgXG4gICAgICApLmpvaW4oXCJcXG5cIil9YDtcbiAgICAgIHNlcmlhbGl6ZXIgPSBGdW5jdGlvbihcIndyaXRlclwiLCBcInZhbHVlXCIsIGJvZHkyKTtcbiAgICAgIFNFUklBTElaRVJTLnNldCh0eSwgc2VyaWFsaXplcik7XG4gICAgICByZXR1cm4gc2VyaWFsaXplcjtcbiAgICB9XG4gICAgY29uc3Qgc2VyaWFsaXplcnMgPSB7fTtcbiAgICBjb25zdCBib2R5ID0gJ1widXNlIHN0cmljdFwiO1xcbicgKyB0eS5lbGVtZW50cy5tYXAoXG4gICAgICAoZWxlbWVudCkgPT4gYHRoaXMuJHtlbGVtZW50Lm5hbWV9KHdyaXRlciwgdmFsdWUuJHtlbGVtZW50Lm5hbWV9KTtgXG4gICAgKS5qb2luKFwiXFxuXCIpO1xuICAgIHNlcmlhbGl6ZXIgPSBGdW5jdGlvbihcIndyaXRlclwiLCBcInZhbHVlXCIsIGJvZHkpLmJpbmQoXG4gICAgICBzZXJpYWxpemVyc1xuICAgICk7XG4gICAgU0VSSUFMSVpFUlMuc2V0KHR5LCBzZXJpYWxpemVyKTtcbiAgICBmb3IgKGNvbnN0IHsgbmFtZSwgYWxnZWJyYWljVHlwZSB9IG9mIHR5LmVsZW1lbnRzKSB7XG4gICAgICBzZXJpYWxpemVyc1tuYW1lXSA9IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIoXG4gICAgICAgIGFsZ2VicmFpY1R5cGUsXG4gICAgICAgIHR5cGVzcGFjZVxuICAgICAgKTtcbiAgICB9XG4gICAgT2JqZWN0LmZyZWV6ZShzZXJpYWxpemVycyk7XG4gICAgcmV0dXJuIHNlcmlhbGl6ZXI7XG4gIH0sXG4gIC8qKiBAZGVwcmVjYXRlZCBVc2UgYG1ha2VTZXJpYWxpemVyYCBpbnN0ZWFkLiAqL1xuICBzZXJpYWxpemVWYWx1ZSh3cml0ZXIsIHR5LCB2YWx1ZSwgdHlwZXNwYWNlKSB7XG4gICAgUHJvZHVjdFR5cGUubWFrZVNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkod3JpdGVyLCB2YWx1ZSk7XG4gIH0sXG4gIG1ha2VEZXNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkge1xuICAgIHN3aXRjaCAodHkuZWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHJldHVybiB1bml0RGVzZXJpYWxpemVyO1xuICAgICAgY2FzZSAxOiB7XG4gICAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IHR5LmVsZW1lbnRzWzBdLm5hbWU7XG4gICAgICAgIGlmIChoYXNPd24oc3BlY2lhbFByb2R1Y3REZXNlcmlhbGl6ZXJzLCBmaWVsZE5hbWUpKVxuICAgICAgICAgIHJldHVybiBzcGVjaWFsUHJvZHVjdERlc2VyaWFsaXplcnNbZmllbGROYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGV0IGRlc2VyaWFsaXplciA9IERFU0VSSUFMSVpFUlMuZ2V0KHR5KTtcbiAgICBpZiAoZGVzZXJpYWxpemVyICE9IG51bGwpIHJldHVybiBkZXNlcmlhbGl6ZXI7XG4gICAgaWYgKGlzRml4ZWRTaXplUHJvZHVjdCh0eSkpIHtcbiAgICAgIGNvbnN0IGJvZHkgPSBgXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCByZXN1bHQgPSB7ICR7dHkuZWxlbWVudHMubWFwKGdldEVsZW1lbnRJbml0aWFsaXplcikuam9pbihcIiwgXCIpfSB9O1xuY29uc3QgdmlldyA9IHJlYWRlci52aWV3O1xuJHt0eS5lbGVtZW50cy5tYXAoXG4gICAgICAgICh7IG5hbWUsIGFsZ2VicmFpY1R5cGU6IHsgdGFnIH0gfSkgPT4gdGFnIGluIHByaW1pdGl2ZUpTTmFtZSA/IHRhZyA9PT0gXCJCb29sXCIgPyBgcmVzdWx0LiR7bmFtZX0gPSB2aWV3LmdldFVpbnQ4KHJlYWRlci5vZmZzZXQpICE9PSAwO1xucmVhZGVyLm9mZnNldCArPSAxO2AgOiBgcmVzdWx0LiR7bmFtZX0gPSB2aWV3LmdldCR7cHJpbWl0aXZlSlNOYW1lW3RhZ119KHJlYWRlci5vZmZzZXQsICR7cHJpbWl0aXZlU2l6ZXNbdGFnXSA+IDEgPyBcInRydWVcIiA6IFwiXCJ9KTtcbnJlYWRlci5vZmZzZXQgKz0gJHtwcmltaXRpdmVTaXplc1t0YWddfTtgIDogYHJlc3VsdC4ke25hbWV9ID0gcmVhZGVyLnJlYWQke3RhZ30oKTtgXG4gICAgICApLmpvaW4oXCJcXG5cIil9XG5yZXR1cm4gcmVzdWx0O2A7XG4gICAgICBkZXNlcmlhbGl6ZXIgPSBGdW5jdGlvbihcInJlYWRlclwiLCBib2R5KTtcbiAgICAgIERFU0VSSUFMSVpFUlMuc2V0KHR5LCBkZXNlcmlhbGl6ZXIpO1xuICAgICAgcmV0dXJuIGRlc2VyaWFsaXplcjtcbiAgICB9XG4gICAgY29uc3QgZGVzZXJpYWxpemVycyA9IHt9O1xuICAgIGRlc2VyaWFsaXplciA9IEZ1bmN0aW9uKFxuICAgICAgXCJyZWFkZXJcIixcbiAgICAgIGBcInVzZSBzdHJpY3RcIjtcbmNvbnN0IHJlc3VsdCA9IHsgJHt0eS5lbGVtZW50cy5tYXAoZ2V0RWxlbWVudEluaXRpYWxpemVyKS5qb2luKFwiLCBcIil9IH07XG4ke3R5LmVsZW1lbnRzLm1hcCgoeyBuYW1lIH0pID0+IGByZXN1bHQuJHtuYW1lfSA9IHRoaXMuJHtuYW1lfShyZWFkZXIpO2ApLmpvaW4oXCJcXG5cIil9XG5yZXR1cm4gcmVzdWx0O2BcbiAgICApLmJpbmQoZGVzZXJpYWxpemVycyk7XG4gICAgREVTRVJJQUxJWkVSUy5zZXQodHksIGRlc2VyaWFsaXplcik7XG4gICAgZm9yIChjb25zdCB7IG5hbWUsIGFsZ2VicmFpY1R5cGUgfSBvZiB0eS5lbGVtZW50cykge1xuICAgICAgZGVzZXJpYWxpemVyc1tuYW1lXSA9IEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcihcbiAgICAgICAgYWxnZWJyYWljVHlwZSxcbiAgICAgICAgdHlwZXNwYWNlXG4gICAgICApO1xuICAgIH1cbiAgICBPYmplY3QuZnJlZXplKGRlc2VyaWFsaXplcnMpO1xuICAgIHJldHVybiBkZXNlcmlhbGl6ZXI7XG4gIH0sXG4gIC8qKiBAZGVwcmVjYXRlZCBVc2UgYG1ha2VEZXNlcmlhbGl6ZXJgIGluc3RlYWQuICovXG4gIGRlc2VyaWFsaXplVmFsdWUocmVhZGVyLCB0eSwgdHlwZXNwYWNlKSB7XG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlLm1ha2VEZXNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkocmVhZGVyKTtcbiAgfSxcbiAgaW50b01hcEtleSh0eSwgdmFsdWUpIHtcbiAgICBpZiAodHkuZWxlbWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICBjb25zdCBmaWVsZE5hbWUgPSB0eS5lbGVtZW50c1swXS5uYW1lO1xuICAgICAgaWYgKGhhc093bihzcGVjaWFsUHJvZHVjdERlc2VyaWFsaXplcnMsIGZpZWxkTmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlW2ZpZWxkTmFtZV07XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHdyaXRlciA9IG5ldyBCaW5hcnlXcml0ZXIoMTApO1xuICAgIEFsZ2VicmFpY1R5cGUuc2VyaWFsaXplVmFsdWUod3JpdGVyLCBBbGdlYnJhaWNUeXBlLlByb2R1Y3QodHkpLCB2YWx1ZSk7XG4gICAgcmV0dXJuIHdyaXRlci50b0Jhc2U2NCgpO1xuICB9XG59O1xudmFyIFN1bVR5cGUgPSB7XG4gIG1ha2VTZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpIHtcbiAgICBpZiAodHkudmFyaWFudHMubGVuZ3RoID09IDIgJiYgdHkudmFyaWFudHNbMF0ubmFtZSA9PT0gXCJzb21lXCIgJiYgdHkudmFyaWFudHNbMV0ubmFtZSA9PT0gXCJub25lXCIpIHtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZSA9IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIoXG4gICAgICAgIHR5LnZhcmlhbnRzWzBdLmFsZ2VicmFpY1R5cGUsXG4gICAgICAgIHR5cGVzcGFjZVxuICAgICAgKTtcbiAgICAgIHJldHVybiAod3JpdGVyLCB2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAodmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHZvaWQgMCkge1xuICAgICAgICAgIHdyaXRlci53cml0ZUJ5dGUoMCk7XG4gICAgICAgICAgc2VyaWFsaXplKHdyaXRlciwgdmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdyaXRlci53cml0ZUJ5dGUoMSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSBlbHNlIGlmICh0eS52YXJpYW50cy5sZW5ndGggPT0gMiAmJiB0eS52YXJpYW50c1swXS5uYW1lID09PSBcIm9rXCIgJiYgdHkudmFyaWFudHNbMV0ubmFtZSA9PT0gXCJlcnJcIikge1xuICAgICAgY29uc3Qgc2VyaWFsaXplT2sgPSBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKFxuICAgICAgICB0eS52YXJpYW50c1swXS5hbGdlYnJhaWNUeXBlLFxuICAgICAgICB0eXBlc3BhY2VcbiAgICAgICk7XG4gICAgICBjb25zdCBzZXJpYWxpemVFcnIgPSBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKFxuICAgICAgICB0eS52YXJpYW50c1sxXS5hbGdlYnJhaWNUeXBlLFxuICAgICAgICB0eXBlc3BhY2VcbiAgICAgICk7XG4gICAgICByZXR1cm4gKHdyaXRlciwgdmFsdWUpID0+IHtcbiAgICAgICAgaWYgKFwib2tcIiBpbiB2YWx1ZSkge1xuICAgICAgICAgIHdyaXRlci53cml0ZVU4KDApO1xuICAgICAgICAgIHNlcmlhbGl6ZU9rKHdyaXRlciwgdmFsdWUub2spO1xuICAgICAgICB9IGVsc2UgaWYgKFwiZXJyXCIgaW4gdmFsdWUpIHtcbiAgICAgICAgICB3cml0ZXIud3JpdGVVOCgxKTtcbiAgICAgICAgICBzZXJpYWxpemVFcnIod3JpdGVyLCB2YWx1ZS5lcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgICBcImNvdWxkIG5vdCBzZXJpYWxpemUgcmVzdWx0OiBvYmplY3QgaGFkIG5laXRoZXIgYSBgb2tgIG5vciBhbiBgZXJyYCBmaWVsZFwiXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHNlcmlhbGl6ZXIgPSBTRVJJQUxJWkVSUy5nZXQodHkpO1xuICAgICAgaWYgKHNlcmlhbGl6ZXIgIT0gbnVsbCkgcmV0dXJuIHNlcmlhbGl6ZXI7XG4gICAgICBjb25zdCBzZXJpYWxpemVycyA9IHt9O1xuICAgICAgY29uc3QgYm9keSA9IGBzd2l0Y2ggKHZhbHVlLnRhZykge1xuJHt0eS52YXJpYW50cy5tYXAoXG4gICAgICAgICh7IG5hbWUgfSwgaSkgPT4gYCAgY2FzZSAke0pTT04uc3RyaW5naWZ5KG5hbWUpfTpcbiAgICB3cml0ZXIud3JpdGVCeXRlKCR7aX0pO1xuICAgIHJldHVybiB0aGlzLiR7bmFtZX0od3JpdGVyLCB2YWx1ZS52YWx1ZSk7YFxuICAgICAgKS5qb2luKFwiXFxuXCIpfVxuICBkZWZhdWx0OlxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICBcXGBDb3VsZCBub3Qgc2VyaWFsaXplIHN1bSB0eXBlOyB1bmtub3duIHRhZyBcXCR7dmFsdWUudGFnfVxcYFxuICAgIClcbn1cbmA7XG4gICAgICBzZXJpYWxpemVyID0gRnVuY3Rpb24oXCJ3cml0ZXJcIiwgXCJ2YWx1ZVwiLCBib2R5KS5iaW5kKFxuICAgICAgICBzZXJpYWxpemVyc1xuICAgICAgKTtcbiAgICAgIFNFUklBTElaRVJTLnNldCh0eSwgc2VyaWFsaXplcik7XG4gICAgICBmb3IgKGNvbnN0IHsgbmFtZSwgYWxnZWJyYWljVHlwZSB9IG9mIHR5LnZhcmlhbnRzKSB7XG4gICAgICAgIHNlcmlhbGl6ZXJzW25hbWVdID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlLFxuICAgICAgICAgIHR5cGVzcGFjZVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgT2JqZWN0LmZyZWV6ZShzZXJpYWxpemVycyk7XG4gICAgICByZXR1cm4gc2VyaWFsaXplcjtcbiAgICB9XG4gIH0sXG4gIC8qKiBAZGVwcmVjYXRlZCBVc2UgYG1ha2VTZXJpYWxpemVyYCBpbnN0ZWFkLiAqL1xuICBzZXJpYWxpemVWYWx1ZSh3cml0ZXIsIHR5LCB2YWx1ZSwgdHlwZXNwYWNlKSB7XG4gICAgU3VtVHlwZS5tYWtlU2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSh3cml0ZXIsIHZhbHVlKTtcbiAgfSxcbiAgbWFrZURlc2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSB7XG4gICAgaWYgKHR5LnZhcmlhbnRzLmxlbmd0aCA9PSAyICYmIHR5LnZhcmlhbnRzWzBdLm5hbWUgPT09IFwic29tZVwiICYmIHR5LnZhcmlhbnRzWzFdLm5hbWUgPT09IFwibm9uZVwiKSB7XG4gICAgICBjb25zdCBkZXNlcmlhbGl6ZSA9IEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcihcbiAgICAgICAgdHkudmFyaWFudHNbMF0uYWxnZWJyYWljVHlwZSxcbiAgICAgICAgdHlwZXNwYWNlXG4gICAgICApO1xuICAgICAgcmV0dXJuIChyZWFkZXIpID0+IHtcbiAgICAgICAgY29uc3QgdGFnID0gcmVhZGVyLnJlYWRVOCgpO1xuICAgICAgICBpZiAodGFnID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGRlc2VyaWFsaXplKHJlYWRlcik7XG4gICAgICAgIH0gZWxzZSBpZiAodGFnID09PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBgQ2FuJ3QgZGVzZXJpYWxpemUgYW4gb3B0aW9uIHR5cGUsIGNvdWxkbid0IGZpbmQgJHt0YWd9IHRhZ2A7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSBlbHNlIGlmICh0eS52YXJpYW50cy5sZW5ndGggPT0gMiAmJiB0eS52YXJpYW50c1swXS5uYW1lID09PSBcIm9rXCIgJiYgdHkudmFyaWFudHNbMV0ubmFtZSA9PT0gXCJlcnJcIikge1xuICAgICAgY29uc3QgZGVzZXJpYWxpemVPayA9IEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcihcbiAgICAgICAgdHkudmFyaWFudHNbMF0uYWxnZWJyYWljVHlwZSxcbiAgICAgICAgdHlwZXNwYWNlXG4gICAgICApO1xuICAgICAgY29uc3QgZGVzZXJpYWxpemVFcnIgPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoXG4gICAgICAgIHR5LnZhcmlhbnRzWzFdLmFsZ2VicmFpY1R5cGUsXG4gICAgICAgIHR5cGVzcGFjZVxuICAgICAgKTtcbiAgICAgIHJldHVybiAocmVhZGVyKSA9PiB7XG4gICAgICAgIGNvbnN0IHRhZyA9IHJlYWRlci5yZWFkQnl0ZSgpO1xuICAgICAgICBpZiAodGFnID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHsgb2s6IGRlc2VyaWFsaXplT2socmVhZGVyKSB9O1xuICAgICAgICB9IGVsc2UgaWYgKHRhZyA9PT0gMSkge1xuICAgICAgICAgIHJldHVybiB7IGVycjogZGVzZXJpYWxpemVFcnIocmVhZGVyKSB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IGBDYW4ndCBkZXNlcmlhbGl6ZSBhIHJlc3VsdCB0eXBlLCBjb3VsZG4ndCBmaW5kICR7dGFnfSB0YWdgO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgZGVzZXJpYWxpemVyID0gREVTRVJJQUxJWkVSUy5nZXQodHkpO1xuICAgICAgaWYgKGRlc2VyaWFsaXplciAhPSBudWxsKSByZXR1cm4gZGVzZXJpYWxpemVyO1xuICAgICAgY29uc3QgZGVzZXJpYWxpemVycyA9IHt9O1xuICAgICAgZGVzZXJpYWxpemVyID0gRnVuY3Rpb24oXG4gICAgICAgIFwicmVhZGVyXCIsXG4gICAgICAgIGBzd2l0Y2ggKHJlYWRlci5yZWFkVTgoKSkge1xuJHt0eS52YXJpYW50cy5tYXAoXG4gICAgICAgICAgKHsgbmFtZSB9LCBpKSA9PiBgY2FzZSAke2l9OiByZXR1cm4geyB0YWc6ICR7SlNPTi5zdHJpbmdpZnkobmFtZSl9LCB2YWx1ZTogdGhpcy4ke25hbWV9KHJlYWRlcikgfTtgXG4gICAgICAgICkuam9pbihcIlxcblwiKX0gfWBcbiAgICAgICkuYmluZChkZXNlcmlhbGl6ZXJzKTtcbiAgICAgIERFU0VSSUFMSVpFUlMuc2V0KHR5LCBkZXNlcmlhbGl6ZXIpO1xuICAgICAgZm9yIChjb25zdCB7IG5hbWUsIGFsZ2VicmFpY1R5cGUgfSBvZiB0eS52YXJpYW50cykge1xuICAgICAgICBkZXNlcmlhbGl6ZXJzW25hbWVdID0gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKFxuICAgICAgICAgIGFsZ2VicmFpY1R5cGUsXG4gICAgICAgICAgdHlwZXNwYWNlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBPYmplY3QuZnJlZXplKGRlc2VyaWFsaXplcnMpO1xuICAgICAgcmV0dXJuIGRlc2VyaWFsaXplcjtcbiAgICB9XG4gIH0sXG4gIC8qKiBAZGVwcmVjYXRlZCBVc2UgYG1ha2VEZXNlcmlhbGl6ZXJgIGluc3RlYWQuICovXG4gIGRlc2VyaWFsaXplVmFsdWUocmVhZGVyLCB0eSwgdHlwZXNwYWNlKSB7XG4gICAgcmV0dXJuIFN1bVR5cGUubWFrZURlc2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKShyZWFkZXIpO1xuICB9XG59O1xuXG4vLyBzcmMvbGliL29wdGlvbi50c1xudmFyIE9wdGlvbiA9IHtcbiAgZ2V0QWxnZWJyYWljVHlwZShpbm5lclR5cGUpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5TdW0oe1xuICAgICAgdmFyaWFudHM6IFtcbiAgICAgICAgeyBuYW1lOiBcInNvbWVcIiwgYWxnZWJyYWljVHlwZTogaW5uZXJUeXBlIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBcIm5vbmVcIixcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLlByb2R1Y3QoeyBlbGVtZW50czogW10gfSlcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pO1xuICB9XG59O1xuXG4vLyBzcmMvbGliL3Jlc3VsdC50c1xudmFyIFJlc3VsdCA9IHtcbiAgZ2V0QWxnZWJyYWljVHlwZShva1R5cGUsIGVyclR5cGUpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5TdW0oe1xuICAgICAgdmFyaWFudHM6IFtcbiAgICAgICAgeyBuYW1lOiBcIm9rXCIsIGFsZ2VicmFpY1R5cGU6IG9rVHlwZSB9LFxuICAgICAgICB7IG5hbWU6IFwiZXJyXCIsIGFsZ2VicmFpY1R5cGU6IGVyclR5cGUgfVxuICAgICAgXVxuICAgIH0pO1xuICB9XG59O1xuXG4vLyBzcmMvbGliL3NjaGVkdWxlX2F0LnRzXG52YXIgU2NoZWR1bGVBdCA9IHtcbiAgaW50ZXJ2YWwodmFsdWUpIHtcbiAgICByZXR1cm4gSW50ZXJ2YWwodmFsdWUpO1xuICB9LFxuICB0aW1lKHZhbHVlKSB7XG4gICAgcmV0dXJuIFRpbWUodmFsdWUpO1xuICB9LFxuICBnZXRBbGdlYnJhaWNUeXBlKCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLlN1bSh7XG4gICAgICB2YXJpYW50czogW1xuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogXCJJbnRlcnZhbFwiLFxuICAgICAgICAgIGFsZ2VicmFpY1R5cGU6IFRpbWVEdXJhdGlvbi5nZXRBbGdlYnJhaWNUeXBlKClcbiAgICAgICAgfSxcbiAgICAgICAgeyBuYW1lOiBcIlRpbWVcIiwgYWxnZWJyYWljVHlwZTogVGltZXN0YW1wLmdldEFsZ2VicmFpY1R5cGUoKSB9XG4gICAgICBdXG4gICAgfSk7XG4gIH0sXG4gIGlzU2NoZWR1bGVBdChhbGdlYnJhaWNUeXBlKSB7XG4gICAgaWYgKGFsZ2VicmFpY1R5cGUudGFnICE9PSBcIlN1bVwiKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHZhcmlhbnRzID0gYWxnZWJyYWljVHlwZS52YWx1ZS52YXJpYW50cztcbiAgICBpZiAodmFyaWFudHMubGVuZ3RoICE9PSAyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGludGVydmFsVmFyaWFudCA9IHZhcmlhbnRzLmZpbmQoKHYpID0+IHYubmFtZSA9PT0gXCJJbnRlcnZhbFwiKTtcbiAgICBjb25zdCB0aW1lVmFyaWFudCA9IHZhcmlhbnRzLmZpbmQoKHYpID0+IHYubmFtZSA9PT0gXCJUaW1lXCIpO1xuICAgIGlmICghaW50ZXJ2YWxWYXJpYW50IHx8ICF0aW1lVmFyaWFudCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gVGltZUR1cmF0aW9uLmlzVGltZUR1cmF0aW9uKGludGVydmFsVmFyaWFudC5hbGdlYnJhaWNUeXBlKSAmJiBUaW1lc3RhbXAuaXNUaW1lc3RhbXAodGltZVZhcmlhbnQuYWxnZWJyYWljVHlwZSk7XG4gIH1cbn07XG52YXIgSW50ZXJ2YWwgPSAobWljcm9zKSA9PiAoe1xuICB0YWc6IFwiSW50ZXJ2YWxcIixcbiAgdmFsdWU6IG5ldyBUaW1lRHVyYXRpb24obWljcm9zKVxufSk7XG52YXIgVGltZSA9IChtaWNyb3NTaW5jZVVuaXhFcG9jaCkgPT4gKHtcbiAgdGFnOiBcIlRpbWVcIixcbiAgdmFsdWU6IG5ldyBUaW1lc3RhbXAobWljcm9zU2luY2VVbml4RXBvY2gpXG59KTtcbnZhciBzY2hlZHVsZV9hdF9kZWZhdWx0ID0gU2NoZWR1bGVBdDtcblxuLy8gc3JjL2xpYi90eXBlX3V0aWwudHNcbmZ1bmN0aW9uIHNldCh4LCB0Mikge1xuICByZXR1cm4geyAuLi54LCAuLi50MiB9O1xufVxuXG4vLyBzcmMvbGliL3R5cGVfYnVpbGRlcnMudHNcbnZhciBUeXBlQnVpbGRlciA9IGNsYXNzIHtcbiAgLyoqXG4gICAqIFRoZSBUeXBlU2NyaXB0IHBoYW50b20gdHlwZS4gVGhpcyBpcyBub3Qgc3RvcmVkIGF0IHJ1bnRpbWUsXG4gICAqIGJ1dCBpcyB2aXNpYmxlIHRvIHRoZSBjb21waWxlclxuICAgKi9cbiAgdHlwZTtcbiAgLyoqXG4gICAqIFRoZSBTcGFjZXRpbWVEQiBhbGdlYnJhaWMgdHlwZSAocnVu4oCRdGltZSB2YWx1ZSkuIEluIGFkZGl0aW9uIHRvIHN0b3JpbmdcbiAgICogdGhlIHJ1bnRpbWUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGBBbGdlYnJhaWNUeXBlYCwgaXQgYWxzbyBjYXB0dXJlc1xuICAgKiB0aGUgVHlwZVNjcmlwdCB0eXBlIGluZm9ybWF0aW9uIG9mIHRoZSBgQWxnZWJyYWljVHlwZWAuIFRoYXQgaXMgdG8gc2F5XG4gICAqIHRoZSB2YWx1ZSBpcyBub3QgbWVyZWx5IGFuIGBBbGdlYnJhaWNUeXBlYCwgYnV0IGlzIGNvbnN0cnVjdGVkIHRvIGJlXG4gICAqIHRoZSBjb3JyZXNwb25kaW5nIGNvbmNyZXRlIGBBbGdlYnJhaWNUeXBlYCBmb3IgdGhlIFR5cGVTY3JpcHQgdHlwZSBgVHlwZWAuXG4gICAqXG4gICAqIGUuZy4gYHN0cmluZ2AgY29ycmVzcG9uZHMgdG8gYEFsZ2VicmFpY1R5cGUuU3RyaW5nYFxuICAgKi9cbiAgYWxnZWJyYWljVHlwZTtcbiAgY29uc3RydWN0b3IoYWxnZWJyYWljVHlwZSkge1xuICAgIHRoaXMuYWxnZWJyYWljVHlwZSA9IGFsZ2VicmFpY1R5cGU7XG4gIH1cbiAgb3B0aW9uYWwoKSB7XG4gICAgcmV0dXJuIG5ldyBPcHRpb25CdWlsZGVyKHRoaXMpO1xuICB9XG4gIHNlcmlhbGl6ZSh3cml0ZXIsIHZhbHVlKSB7XG4gICAgY29uc3Qgc2VyaWFsaXplID0gdGhpcy5zZXJpYWxpemUgPSBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKFxuICAgICAgdGhpcy5hbGdlYnJhaWNUeXBlXG4gICAgKTtcbiAgICBzZXJpYWxpemUod3JpdGVyLCB2YWx1ZSk7XG4gIH1cbiAgZGVzZXJpYWxpemUocmVhZGVyKSB7XG4gICAgY29uc3QgZGVzZXJpYWxpemUgPSB0aGlzLmRlc2VyaWFsaXplID0gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKFxuICAgICAgdGhpcy5hbGdlYnJhaWNUeXBlXG4gICAgKTtcbiAgICByZXR1cm4gZGVzZXJpYWxpemUocmVhZGVyKTtcbiAgfVxufTtcbnZhciBVOEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5VOCk7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBVOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgVThDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSkpO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBVOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBVOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFU4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgVThDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgVTE2QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLlUxNik7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBVMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IFUxNkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KSk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IFUxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBVMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBVMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBVMTZDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgVTMyQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLlUzMik7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBVMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IFUzMkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KSk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IFUzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBVMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBVMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBVMzJDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgVTY0QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLlU2NCk7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBVNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IFU2NENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KSk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IFU2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBVNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBVNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBVNjRDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgVTEyOEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5VMTI4KTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IFUxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IFUxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBVMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IFUxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBVMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgVTEyOENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBVMjU2QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLlUyNTYpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgVTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgVTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IFUyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgVTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFUyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBVMjU2Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIEk4QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkk4KTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IEk4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBJOENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KSk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IEk4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IEk4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBJOENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBJMTZCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuSTE2KTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IEkxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgSTE2Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgSTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IEkxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IEkxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IEkxNkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBJMzJCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuSTMyKTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IEkzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgSTMyQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgSTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IEkzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IEkzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IEkzMkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBJNjRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuSTY0KTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IEk2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgSTY0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgSTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IEk2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IEk2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IEk2NENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBJMTI4QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkkxMjgpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgSTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgSTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IEkxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgSTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IEkxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBJMTI4Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIEkyNTZCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuSTI1Nik7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBJMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBJMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgSTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBJMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgSTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IEkyNTZDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgRjMyQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkYzMik7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgRjMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgRjMyQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIEY2NEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5GNjQpO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IEY2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IEY2NENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBCb29sQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkJvb2wpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgQm9vbENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgQm9vbENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IEJvb2xDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBCb29sQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgQm9vbENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBTdHJpbmdCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuU3RyaW5nKTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IFN0cmluZ0NvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgU3RyaW5nQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgU3RyaW5nQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgU3RyaW5nQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgU3RyaW5nQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIEFycmF5QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBlbGVtZW50O1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5BcnJheShlbGVtZW50LmFsZ2VicmFpY1R5cGUpKTtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IEFycmF5Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgQXJyYXlDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgQnl0ZUFycmF5QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkFycmF5KEFsZ2VicmFpY1R5cGUuVTgpKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBCeXRlQXJyYXlDb2x1bW5CdWlsZGVyKFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IEJ5dGVBcnJheUNvbHVtbkJ1aWxkZXIoc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBPcHRpb25CdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIHZhbHVlO1xuICBjb25zdHJ1Y3Rvcih2YWx1ZSkge1xuICAgIHN1cGVyKE9wdGlvbi5nZXRBbGdlYnJhaWNUeXBlKHZhbHVlLmFsZ2VicmFpY1R5cGUpKTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgT3B0aW9uQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgT3B0aW9uQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIFByb2R1Y3RCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIHR5cGVOYW1lO1xuICBlbGVtZW50cztcbiAgY29uc3RydWN0b3IoZWxlbWVudHMsIG5hbWUpIHtcbiAgICBmdW5jdGlvbiBlbGVtZW50c0FycmF5RnJvbUVsZW1lbnRzT2JqKG9iaikge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubWFwKChrZXkpID0+ICh7XG4gICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgLy8gTGF6aWx5IHJlc29sdmUgdGhlIHVuZGVybHlpbmcgb2JqZWN0J3MgYWxnZWJyYWljVHlwZS5cbiAgICAgICAgLy8gVGhpcyB3aWxsIGNhbGwgb2JqW2tleV0uYWxnZWJyYWljVHlwZSBvbmx5IHdoZW4gc29tZW9uZVxuICAgICAgICAvLyBhY3R1YWxseSByZWFkcyB0aGlzIHByb3BlcnR5LlxuICAgICAgICBnZXQgYWxnZWJyYWljVHlwZSgpIHtcbiAgICAgICAgICByZXR1cm4gb2JqW2tleV0uYWxnZWJyYWljVHlwZTtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuICAgIH1cbiAgICBzdXBlcihcbiAgICAgIEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7XG4gICAgICAgIGVsZW1lbnRzOiBlbGVtZW50c0FycmF5RnJvbUVsZW1lbnRzT2JqKGVsZW1lbnRzKVxuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMudHlwZU5hbWUgPSBuYW1lO1xuICAgIHRoaXMuZWxlbWVudHMgPSBlbGVtZW50cztcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9kdWN0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgUHJvZHVjdENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBSZXN1bHRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIG9rO1xuICBlcnI7XG4gIGNvbnN0cnVjdG9yKG9rLCBlcnIpIHtcbiAgICBzdXBlcihSZXN1bHQuZ2V0QWxnZWJyYWljVHlwZShvay5hbGdlYnJhaWNUeXBlLCBlcnIuYWxnZWJyYWljVHlwZSkpO1xuICAgIHRoaXMub2sgPSBvaztcbiAgICB0aGlzLmVyciA9IGVycjtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBSZXN1bHRDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KSk7XG4gIH1cbn07XG52YXIgVW5pdEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoeyB0YWc6IFwiUHJvZHVjdFwiLCB2YWx1ZTogeyBlbGVtZW50czogW10gfSB9KTtcbiAgfVxufTtcbnZhciBSb3dCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIHJvdztcbiAgdHlwZU5hbWU7XG4gIGNvbnN0cnVjdG9yKHJvdywgbmFtZSkge1xuICAgIGNvbnN0IG1hcHBlZFJvdyA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgIE9iamVjdC5lbnRyaWVzKHJvdykubWFwKChbY29sTmFtZSwgYnVpbGRlcl0pID0+IFtcbiAgICAgICAgY29sTmFtZSxcbiAgICAgICAgYnVpbGRlciBpbnN0YW5jZW9mIENvbHVtbkJ1aWxkZXIgPyBidWlsZGVyIDogbmV3IENvbHVtbkJ1aWxkZXIoYnVpbGRlciwge30pXG4gICAgICBdKVxuICAgICk7XG4gICAgY29uc3QgZWxlbWVudHMgPSBPYmplY3Qua2V5cyhtYXBwZWRSb3cpLm1hcCgobmFtZTIpID0+ICh7XG4gICAgICBuYW1lOiBuYW1lMixcbiAgICAgIGdldCBhbGdlYnJhaWNUeXBlKCkge1xuICAgICAgICByZXR1cm4gbWFwcGVkUm93W25hbWUyXS50eXBlQnVpbGRlci5hbGdlYnJhaWNUeXBlO1xuICAgICAgfVxuICAgIH0pKTtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLlByb2R1Y3QoeyBlbGVtZW50cyB9KSk7XG4gICAgdGhpcy5yb3cgPSBtYXBwZWRSb3c7XG4gICAgdGhpcy50eXBlTmFtZSA9IG5hbWU7XG4gIH1cbn07XG52YXIgU3VtQnVpbGRlckltcGwgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgdmFyaWFudHM7XG4gIHR5cGVOYW1lO1xuICBjb25zdHJ1Y3Rvcih2YXJpYW50cywgbmFtZSkge1xuICAgIGZ1bmN0aW9uIHZhcmlhbnRzQXJyYXlGcm9tVmFyaWFudHNPYmoodmFyaWFudHMyKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXModmFyaWFudHMyKS5tYXAoKGtleSkgPT4gKHtcbiAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAvLyBMYXppbHkgcmVzb2x2ZSB0aGUgdW5kZXJseWluZyBvYmplY3QncyBhbGdlYnJhaWNUeXBlLlxuICAgICAgICAvLyBUaGlzIHdpbGwgY2FsbCBvYmpba2V5XS5hbGdlYnJhaWNUeXBlIG9ubHkgd2hlbiBzb21lb25lXG4gICAgICAgIC8vIGFjdHVhbGx5IHJlYWRzIHRoaXMgcHJvcGVydHkuXG4gICAgICAgIGdldCBhbGdlYnJhaWNUeXBlKCkge1xuICAgICAgICAgIHJldHVybiB2YXJpYW50czJba2V5XS5hbGdlYnJhaWNUeXBlO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgfVxuICAgIHN1cGVyKFxuICAgICAgQWxnZWJyYWljVHlwZS5TdW0oe1xuICAgICAgICB2YXJpYW50czogdmFyaWFudHNBcnJheUZyb21WYXJpYW50c09iaih2YXJpYW50cylcbiAgICAgIH0pXG4gICAgKTtcbiAgICB0aGlzLnZhcmlhbnRzID0gdmFyaWFudHM7XG4gICAgdGhpcy50eXBlTmFtZSA9IG5hbWU7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXModmFyaWFudHMpKSB7XG4gICAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YXJpYW50cywga2V5KTtcbiAgICAgIGNvbnN0IGlzQWNjZXNzb3IgPSAhIWRlc2MgJiYgKHR5cGVvZiBkZXNjLmdldCA9PT0gXCJmdW5jdGlvblwiIHx8IHR5cGVvZiBkZXNjLnNldCA9PT0gXCJmdW5jdGlvblwiKTtcbiAgICAgIGxldCBpc1VuaXQyID0gZmFsc2U7XG4gICAgICBpZiAoIWlzQWNjZXNzb3IpIHtcbiAgICAgICAgY29uc3QgdmFyaWFudCA9IHZhcmlhbnRzW2tleV07XG4gICAgICAgIGlzVW5pdDIgPSB2YXJpYW50IGluc3RhbmNlb2YgVW5pdEJ1aWxkZXI7XG4gICAgICB9XG4gICAgICBpZiAoaXNVbml0Mikge1xuICAgICAgICBjb25zdCBjb25zdGFudCA9IHRoaXMuY3JlYXRlKGtleSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBrZXksIHtcbiAgICAgICAgICB2YWx1ZTogY29uc3RhbnQsXG4gICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGZuID0gKCh2YWx1ZSkgPT4gdGhpcy5jcmVhdGUoa2V5LCB2YWx1ZSkpO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywga2V5LCB7XG4gICAgICAgICAgdmFsdWU6IGZuLFxuICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNyZWF0ZSh0YWcsIHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB2b2lkIDAgPyB7IHRhZyB9IDogeyB0YWcsIHZhbHVlIH07XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgU3VtQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgU3VtQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgU3VtQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgU3VtQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgU3VtQnVpbGRlciA9IFN1bUJ1aWxkZXJJbXBsO1xudmFyIFNpbXBsZVN1bUJ1aWxkZXJJbXBsID0gY2xhc3MgZXh0ZW5kcyBTdW1CdWlsZGVySW1wbCB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgU2ltcGxlU3VtQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgU2ltcGxlU3VtQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgU2ltcGxlU3VtQnVpbGRlciA9IFNpbXBsZVN1bUJ1aWxkZXJJbXBsO1xudmFyIFNjaGVkdWxlQXRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKHNjaGVkdWxlX2F0X2RlZmF1bHQuZ2V0QWxnZWJyYWljVHlwZSgpKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBTY2hlZHVsZUF0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgU2NoZWR1bGVBdENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBJZGVudGl0eUJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoSWRlbnRpdHkuZ2V0QWxnZWJyYWljVHlwZSgpKTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IElkZW50aXR5Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBJZGVudGl0eUNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IElkZW50aXR5Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IElkZW50aXR5Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBJZGVudGl0eUNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBDb25uZWN0aW9uSWRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKENvbm5lY3Rpb25JZC5nZXRBbGdlYnJhaWNUeXBlKCkpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBDb25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBDb25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIFRpbWVzdGFtcEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoVGltZXN0YW1wLmdldEFsZ2VicmFpY1R5cGUoKSk7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBUaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBUaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBUaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBUaW1lc3RhbXBDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgVGltZUR1cmF0aW9uQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihUaW1lRHVyYXRpb24uZ2V0QWxnZWJyYWljVHlwZSgpKTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBVdWlkQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihVdWlkLmdldEFsZ2VicmFpY1R5cGUoKSk7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBVdWlkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBVdWlkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgVXVpZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBVdWlkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgVXVpZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFV1aWRDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgZGVmYXVsdE1ldGFkYXRhID0ge307XG52YXIgQ29sdW1uQnVpbGRlciA9IGNsYXNzIHtcbiAgdHlwZUJ1aWxkZXI7XG4gIGNvbHVtbk1ldGFkYXRhO1xuICBjb25zdHJ1Y3Rvcih0eXBlQnVpbGRlciwgbWV0YWRhdGEpIHtcbiAgICB0aGlzLnR5cGVCdWlsZGVyID0gdHlwZUJ1aWxkZXI7XG4gICAgdGhpcy5jb2x1bW5NZXRhZGF0YSA9IG1ldGFkYXRhO1xuICB9XG4gIHNlcmlhbGl6ZSh3cml0ZXIsIHZhbHVlKSB7XG4gICAgdGhpcy50eXBlQnVpbGRlci5zZXJpYWxpemUod3JpdGVyLCB2YWx1ZSk7XG4gIH1cbiAgZGVzZXJpYWxpemUocmVhZGVyKSB7XG4gICAgcmV0dXJuIHRoaXMudHlwZUJ1aWxkZXIuZGVzZXJpYWxpemUocmVhZGVyKTtcbiAgfVxufTtcbnZhciBVOENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfVThDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9VOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9VOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBVMTZDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1UxNkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfVTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX1UxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfVTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBfVTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9VMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9VMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIFUzMkNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfVTMyQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9VMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfVTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9VMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IF9VMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX1UzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX1UzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgVTY0Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9VNjRDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX1U2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9VNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX1U2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgX1U2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfVTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfVTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBVMTI4Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9VMTI4Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9VMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX1UxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX1UxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IF9VMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9VMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfVTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgVTI1NkNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfVTI1NkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfVTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9VMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9VMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBfVTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfVTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX1UyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEk4Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9JOENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX0k4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0k4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEkxNkNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfSTE2Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9JMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9JMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IF9JMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0kxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX0kxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgSTMyQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9JMzJDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX0kzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9JMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX0kzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgX0kzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfSTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfSTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBJNjRDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0k2NENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfSTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX0k2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9JNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9JNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEkxMjhDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0kxMjhDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX0kxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgX0kxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0kxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9JMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBJMjU2Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9JMjU2Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9JMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX0kyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX0kyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IF9JMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9JMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfSTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgRjMyQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9GMzJDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9GMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9GMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEY2NENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfRjY0Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfRjY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfRjY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBCb29sQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9Cb29sQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9Cb29sQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX0Jvb2xDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX0Jvb2xDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0Jvb2xDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9Cb29sQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBTdHJpbmdDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1N0cmluZ0NvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfU3RyaW5nQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX1N0cmluZ0NvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfU3RyaW5nQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9TdHJpbmdDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9TdHJpbmdDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEFycmF5Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9BcnJheUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0FycmF5Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfQXJyYXlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEJ5dGVBcnJheUNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfQnl0ZUFycmF5Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcihtZXRhZGF0YSkge1xuICAgIHN1cGVyKG5ldyBUeXBlQnVpbGRlcihBbGdlYnJhaWNUeXBlLkFycmF5KEFsZ2VicmFpY1R5cGUuVTgpKSwgbWV0YWRhdGEpO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9CeXRlQXJyYXlDb2x1bW5CdWlsZGVyKFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfQnl0ZUFycmF5Q29sdW1uQnVpbGRlcihzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBPcHRpb25Db2x1bW5CdWlsZGVyID0gY2xhc3MgX09wdGlvbkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX09wdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX09wdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgUmVzdWx0Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9SZXN1bHRDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKHR5cGVCdWlsZGVyLCBtZXRhZGF0YSkge1xuICAgIHN1cGVyKHR5cGVCdWlsZGVyLCBtZXRhZGF0YSk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX1Jlc3VsdENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG59O1xudmFyIFByb2R1Y3RDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1Byb2R1Y3RDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9Qcm9kdWN0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9Qcm9kdWN0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBTdW1Db2x1bW5CdWlsZGVyID0gY2xhc3MgX1N1bUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX1N1bUNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfU3VtQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9TdW1Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX1N1bUNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBTaW1wbGVTdW1Db2x1bW5CdWlsZGVyID0gY2xhc3MgX1NpbXBsZVN1bUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBTdW1Db2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfU2ltcGxlU3VtQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9TaW1wbGVTdW1Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgU2NoZWR1bGVBdENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfU2NoZWR1bGVBdENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX1NjaGVkdWxlQXRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX1NjaGVkdWxlQXRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIElkZW50aXR5Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9JZGVudGl0eUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX0lkZW50aXR5Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9JZGVudGl0eUNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIENvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9Db25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9Db25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0Nvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBUaW1lc3RhbXBDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1RpbWVzdGFtcENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX1RpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9UaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX1RpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9UaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX1RpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9UaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX1RpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9UaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIFV1aWRDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1V1aWRDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX1V1aWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfVXVpZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfVXVpZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfVXVpZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfVXVpZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgUmVmQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICByZWY7XG4gIC8qKiBUaGUgcGhhbnRvbSB0eXBlIG9mIHRoZSBwb2ludGVlIG9mIHRoaXMgcmVmLiAqL1xuICBfX3NwYWNldGltZVR5cGU7XG4gIGNvbnN0cnVjdG9yKHJlZikge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuUmVmKHJlZikpO1xuICAgIHRoaXMucmVmID0gcmVmO1xuICB9XG59O1xudmFyIGVudW1JbXBsID0gKChuYW1lT3JPYmosIG1heWJlT2JqKSA9PiB7XG4gIGxldCBvYmogPSBuYW1lT3JPYmo7XG4gIGxldCBuYW1lID0gdm9pZCAwO1xuICBpZiAodHlwZW9mIG5hbWVPck9iaiA9PT0gXCJzdHJpbmdcIikge1xuICAgIGlmICghbWF5YmVPYmopIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgIFwiV2hlbiBwcm92aWRpbmcgYSBuYW1lLCB5b3UgbXVzdCBhbHNvIHByb3ZpZGUgdGhlIHZhcmlhbnRzIG9iamVjdCBvciBhcnJheS5cIlxuICAgICAgKTtcbiAgICB9XG4gICAgb2JqID0gbWF5YmVPYmo7XG4gICAgbmFtZSA9IG5hbWVPck9iajtcbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgY29uc3Qgc2ltcGxlVmFyaWFudHNPYmogPSB7fTtcbiAgICBmb3IgKGNvbnN0IHZhcmlhbnQgb2Ygb2JqKSB7XG4gICAgICBzaW1wbGVWYXJpYW50c09ialt2YXJpYW50XSA9IG5ldyBVbml0QnVpbGRlcigpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFNpbXBsZVN1bUJ1aWxkZXJJbXBsKHNpbXBsZVZhcmlhbnRzT2JqLCBuYW1lKTtcbiAgfVxuICByZXR1cm4gbmV3IFN1bUJ1aWxkZXIob2JqLCBuYW1lKTtcbn0pO1xudmFyIHQgPSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBCb29sYCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgYm9vbGVhbmAgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEJvb2xCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgYm9vbDogKCkgPT4gbmV3IEJvb2xCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBTdHJpbmdgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBzdHJpbmdgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBTdHJpbmdCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgc3RyaW5nOiAoKSA9PiBuZXcgU3RyaW5nQnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgRjY0YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgRjY0QnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIG51bWJlcjogKCkgPT4gbmV3IEY2NEJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYEk4YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgSThCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgaTg6ICgpID0+IG5ldyBJOEJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYFU4YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVThCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgdTg6ICgpID0+IG5ldyBVOEJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYEkxNmAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcbiAgICogUmVwcmVzZW50ZWQgYXMgYG51bWJlcmAgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEkxNkJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICBpMTY6ICgpID0+IG5ldyBJMTZCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBVMTZgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBVMTZCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgdTE2OiAoKSA9PiBuZXcgVTE2QnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgSTMyYCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgSTMyQnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIGkzMjogKCkgPT4gbmV3IEkzMkJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYFUzMmAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcbiAgICogUmVwcmVzZW50ZWQgYXMgYG51bWJlcmAgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFUzMkJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICB1MzI6ICgpID0+IG5ldyBVMzJCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBJNjRgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBiaWdpbnRgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBJNjRCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgaTY0OiAoKSA9PiBuZXcgSTY0QnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgVTY0YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgYmlnaW50YCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVTY0QnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIHU2NDogKCkgPT4gbmV3IFU2NEJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYEkxMjhgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBiaWdpbnRgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBJMTI4QnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIGkxMjg6ICgpID0+IG5ldyBJMTI4QnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgVTEyOGAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcbiAgICogUmVwcmVzZW50ZWQgYXMgYGJpZ2ludGAgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFUxMjhCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgdTEyODogKCkgPT4gbmV3IFUxMjhCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBJMjU2YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgYmlnaW50YCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgSTI1NkJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICBpMjU2OiAoKSA9PiBuZXcgSTI1NkJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYFUyNTZgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBiaWdpbnRgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBVMjU2QnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIHUyNTY6ICgpID0+IG5ldyBVMjU2QnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgRjMyYCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgRjMyQnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIGYzMjogKCkgPT4gbmV3IEYzMkJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYEY2NGAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcbiAgICogUmVwcmVzZW50ZWQgYXMgYG51bWJlcmAgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEY2NEJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICBmNjQ6ICgpID0+IG5ldyBGNjRCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBQcm9kdWN0YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9ucy4gUHJvZHVjdCB0eXBlcyBpbiBTcGFjZXRpbWVEQlxuICAgKiBhcmUgZXNzZW50aWFsbHkgdGhlIHNhbWUgYXMgb2JqZWN0cyBpbiBKYXZhU2NyaXB0L1R5cGVTY3JpcHQuXG4gICAqIFByb3BlcnRpZXMgb2YgdGhlIG9iamVjdCBtdXN0IGFsc28gYmUge0BsaW5rIFR5cGVCdWlsZGVyfXMuXG4gICAqIFJlcHJlc2VudGVkIGFzIGFuIG9iamVjdCB3aXRoIHNwZWNpZmljIHByb3BlcnRpZXMgaW4gVHlwZVNjcmlwdC5cbiAgICpcbiAgICogQHBhcmFtIG5hbWUgKG9wdGlvbmFsKSBBIGRpc3BsYXkgbmFtZSBmb3IgdGhlIHByb2R1Y3QgdHlwZS4gSWYgb21pdHRlZCwgYW4gYW5vbnltb3VzIHByb2R1Y3QgdHlwZSBpcyBjcmVhdGVkLlxuICAgKiBAcGFyYW0gb2JqIFRoZSBvYmplY3QgZGVmaW5pbmcgdGhlIHByb3BlcnRpZXMgb2YgdGhlIHR5cGUsIHdob3NlIHByb3BlcnR5XG4gICAqIHZhbHVlcyBtdXN0IGJlIHtAbGluayBUeXBlQnVpbGRlcn1zLlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgUHJvZHVjdEJ1aWxkZXJ9IGluc3RhbmNlLlxuICAgKi9cbiAgb2JqZWN0OiAoKG5hbWVPck9iaiwgbWF5YmVPYmopID0+IHtcbiAgICBpZiAodHlwZW9mIG5hbWVPck9iaiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgaWYgKCFtYXliZU9iaikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIFwiV2hlbiBwcm92aWRpbmcgYSBuYW1lLCB5b3UgbXVzdCBhbHNvIHByb3ZpZGUgdGhlIG9iamVjdC5cIlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBQcm9kdWN0QnVpbGRlcihtYXliZU9iaiwgbmFtZU9yT2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm9kdWN0QnVpbGRlcihuYW1lT3JPYmosIHZvaWQgMCk7XG4gIH0pLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgUm93YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9ucy4gUm93IHR5cGVzIGluIFNwYWNldGltZURCXG4gICAqIGFyZSBzaW1pbGFyIHRvIGBQcm9kdWN0YCB0eXBlcywgYnV0IGFyZSBzcGVjaWZpY2FsbHkgdXNlZCB0byBkZWZpbmUgdGhlIHNjaGVtYSBvZiBhIHRhYmxlIHJvdy5cbiAgICogUHJvcGVydGllcyBvZiB0aGUgb2JqZWN0IG11c3QgYWxzbyBiZSB7QGxpbmsgVHlwZUJ1aWxkZXJ9IG9yIHtAbGluayBDb2x1bW5CdWlsZGVyfXMuXG4gICAqXG4gICAqIFlvdSBjYW4gcmVwcmVzZW50IGEgYFJvd2AgYXMgZWl0aGVyIGEge0BsaW5rIFJvd09ian0gb3IgYW4ge0BsaW5rIFJvd0J1aWxkZXJ9IHR5cGUgd2hlblxuICAgKiBkZWZpbmluZyBhIHRhYmxlIHNjaGVtYS5cbiAgICpcbiAgICogVGhlIHtAbGluayBSb3dCdWlsZGVyfSB0eXBlIGlzIHVzZWZ1bCB3aGVuIHlvdSB3YW50IHRvIGNyZWF0ZSBhIHR5cGUgd2hpY2ggY2FuIGJlIHVzZWQgYW55d2hlcmVcbiAgICogYSB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGlzIGFjY2VwdGVkLCBzdWNoIGFzIGluIG5lc3RlZCBvYmplY3RzIG9yIGFycmF5cywgb3IgYXMgdGhlIGFyZ3VtZW50XG4gICAqIHRvIGEgc2NoZWR1bGVkIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gb2JqIFRoZSBvYmplY3QgZGVmaW5pbmcgdGhlIHByb3BlcnRpZXMgb2YgdGhlIHJvdywgd2hvc2UgcHJvcGVydHlcbiAgICogdmFsdWVzIG11c3QgYmUge0BsaW5rIFR5cGVCdWlsZGVyfXMgb3Ige0BsaW5rIENvbHVtbkJ1aWxkZXJ9cy5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFJvd0J1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICByb3c6ICgobmFtZU9yT2JqLCBtYXliZU9iaikgPT4ge1xuICAgIGNvbnN0IFtvYmosIG5hbWVdID0gdHlwZW9mIG5hbWVPck9iaiA9PT0gXCJzdHJpbmdcIiA/IFttYXliZU9iaiwgbmFtZU9yT2JqXSA6IFtuYW1lT3JPYmosIHZvaWQgMF07XG4gICAgcmV0dXJuIG5ldyBSb3dCdWlsZGVyKG9iaiwgbmFtZSk7XG4gIH0pLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgQXJyYXlgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zLlxuICAgKiBSZXByZXNlbnRlZCBhcyBhbiBhcnJheSBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCB0eXBlIG9mIHRoZSBhcnJheSwgd2hpY2ggbXVzdCBiZSBhIGBUeXBlQnVpbGRlcmAuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBBcnJheUJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICBhcnJheShlKSB7XG4gICAgcmV0dXJuIG5ldyBBcnJheUJ1aWxkZXIoZSk7XG4gIH0sXG4gIGVudW06IGVudW1JbXBsLFxuICAvKipcbiAgICogVGhpcyBpcyBhIHNwZWNpYWwgaGVscGVyIGZ1bmN0aW9uIGZvciBjb252ZW5pZW50bHkgY3JlYXRpbmcgYFByb2R1Y3RgIHR5cGUgY29sdW1ucyB3aXRoIG5vIGZpZWxkcy5cbiAgICpcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFByb2R1Y3RCdWlsZGVyfSBpbnN0YW5jZSB3aXRoIG5vIGZpZWxkcy5cbiAgICovXG4gIHVuaXQoKSB7XG4gICAgcmV0dXJuIG5ldyBVbml0QnVpbGRlcigpO1xuICB9LFxuICAvKipcbiAgICogQ3JlYXRlcyBhIGxhemlseS1ldmFsdWF0ZWQge0BsaW5rIFR5cGVCdWlsZGVyfS4gVGhpcyBpcyB1c2VmdWwgZm9yIGNyZWF0aW5nXG4gICAqIHJlY3Vyc2l2ZSB0eXBlcywgc3VjaCBhcyBhIHRyZWUgb3IgbGlua2VkIGxpc3QuXG4gICAqIEBwYXJhbSB0aHVuayBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHtAbGluayBUeXBlQnVpbGRlcn0uXG4gICAqIEByZXR1cm5zIEEgcHJveHkge0BsaW5rIFR5cGVCdWlsZGVyfSB0aGF0IGV2YWx1YXRlcyB0aGUgdGh1bmsgb24gZmlyc3QgYWNjZXNzLlxuICAgKi9cbiAgbGF6eSh0aHVuaykge1xuICAgIGxldCBjYWNoZWQgPSBudWxsO1xuICAgIGNvbnN0IGdldCA9ICgpID0+IGNhY2hlZCA/Pz0gdGh1bmsoKTtcbiAgICBjb25zdCBwcm94eSA9IG5ldyBQcm94eSh7fSwge1xuICAgICAgZ2V0KF90LCBwcm9wLCByZWN2KSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGdldCgpO1xuICAgICAgICBjb25zdCB2YWwgPSBSZWZsZWN0LmdldCh0YXJnZXQsIHByb3AsIHJlY3YpO1xuICAgICAgICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gXCJmdW5jdGlvblwiID8gdmFsLmJpbmQodGFyZ2V0KSA6IHZhbDtcbiAgICAgIH0sXG4gICAgICBzZXQoX3QsIHByb3AsIHZhbHVlLCByZWN2KSB7XG4gICAgICAgIHJldHVybiBSZWZsZWN0LnNldChnZXQoKSwgcHJvcCwgdmFsdWUsIHJlY3YpO1xuICAgICAgfSxcbiAgICAgIGhhcyhfdCwgcHJvcCkge1xuICAgICAgICByZXR1cm4gcHJvcCBpbiBnZXQoKTtcbiAgICAgIH0sXG4gICAgICBvd25LZXlzKCkge1xuICAgICAgICByZXR1cm4gUmVmbGVjdC5vd25LZXlzKGdldCgpKTtcbiAgICAgIH0sXG4gICAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoX3QsIHByb3ApIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZ2V0KCksIHByb3ApO1xuICAgICAgfSxcbiAgICAgIGdldFByb3RvdHlwZU9mKCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmdldFByb3RvdHlwZU9mKGdldCgpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcHJveHk7XG4gIH0sXG4gIC8qKlxuICAgKiBUaGlzIGlzIGEgc3BlY2lhbCBoZWxwZXIgZnVuY3Rpb24gZm9yIGNvbnZlbmllbnRseSBjcmVhdGluZyB7QGxpbmsgU2NoZWR1bGVBdH0gdHlwZSBjb2x1bW5zLlxuICAgKiBAcmV0dXJucyBBIG5ldyBDb2x1bW5CdWlsZGVyIGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBTY2hlZHVsZUF0fSB0eXBlLlxuICAgKi9cbiAgc2NoZWR1bGVBdDogKCkgPT4ge1xuICAgIHJldHVybiBuZXcgU2NoZWR1bGVBdEJ1aWxkZXIoKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBPcHRpb259IHR5cGUuXG4gICAqIFlvdSBjYW4gY3JlYXRlIGEgY29sdW1uIG9mIHRoZSBzYW1lIHR5cGUgYnkgY29uc3RydWN0aW5nIGFuIGVudW0gd2l0aCBhIGBzb21lYCBhbmQgYG5vbmVgIHZhcmlhbnQuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdHlwZSBvZiB0aGUgdmFsdWUgY29udGFpbmVkIGluIHRoZSBgc29tZWAgdmFyaWFudCBvZiB0aGUgYE9wdGlvbmAuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBPcHRpb25CdWlsZGVyfSBpbnN0YW5jZSB3aXRoIHRoZSB7QGxpbmsgT3B0aW9ufSB0eXBlLlxuICAgKi9cbiAgb3B0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBPcHRpb25CdWlsZGVyKHZhbHVlKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBSZXN1bHR9IHR5cGUuXG4gICAqIFlvdSBjYW4gY3JlYXRlIGEgY29sdW1uIG9mIHRoZSBzYW1lIHR5cGUgYnkgY29uc3RydWN0aW5nIGFuIGVudW0gd2l0aCBhbiBgb2tgIGFuZCBgZXJyYCB2YXJpYW50LlxuICAgKiBAcGFyYW0gb2sgVGhlIHR5cGUgb2YgdGhlIHZhbHVlIGNvbnRhaW5lZCBpbiB0aGUgYG9rYCB2YXJpYW50IG9mIHRoZSBgUmVzdWx0YC5cbiAgICogQHBhcmFtIGVyciBUaGUgdHlwZSBvZiB0aGUgdmFsdWUgY29udGFpbmVkIGluIHRoZSBgZXJyYCB2YXJpYW50IG9mIHRoZSBgUmVzdWx0YC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFJlc3VsdEJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBSZXN1bHR9IHR5cGUuXG4gICAqL1xuICByZXN1bHQob2ssIGVycikge1xuICAgIHJldHVybiBuZXcgUmVzdWx0QnVpbGRlcihvaywgZXJyKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBJZGVudGl0eX0gdHlwZS5cbiAgICogWW91IGNhbiBjcmVhdGUgYSBjb2x1bW4gb2YgdGhlIHNhbWUgdHlwZSBieSBjb25zdHJ1Y3RpbmcgYW4gYG9iamVjdGAgd2l0aCBhIHNpbmdsZSBgX19pZGVudGl0eV9fYCBlbGVtZW50LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBJZGVudGl0eX0gdHlwZS5cbiAgICovXG4gIGlkZW50aXR5OiAoKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBJZGVudGl0eUJ1aWxkZXIoKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBDb25uZWN0aW9uSWR9IHR5cGUuXG4gICAqIFlvdSBjYW4gY3JlYXRlIGEgY29sdW1uIG9mIHRoZSBzYW1lIHR5cGUgYnkgY29uc3RydWN0aW5nIGFuIGBvYmplY3RgIHdpdGggYSBzaW5nbGUgYF9fY29ubmVjdGlvbl9pZF9fYCBlbGVtZW50LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBDb25uZWN0aW9uSWR9IHR5cGUuXG4gICAqL1xuICBjb25uZWN0aW9uSWQ6ICgpID0+IHtcbiAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25JZEJ1aWxkZXIoKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBUaW1lc3RhbXB9IHR5cGUuXG4gICAqIFlvdSBjYW4gY3JlYXRlIGEgY29sdW1uIG9mIHRoZSBzYW1lIHR5cGUgYnkgY29uc3RydWN0aW5nIGFuIGBvYmplY3RgIHdpdGggYSBzaW5nbGUgYF9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX19gIGVsZW1lbnQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBUeXBlQnVpbGRlcn0gaW5zdGFuY2Ugd2l0aCB0aGUge0BsaW5rIFRpbWVzdGFtcH0gdHlwZS5cbiAgICovXG4gIHRpbWVzdGFtcDogKCkgPT4ge1xuICAgIHJldHVybiBuZXcgVGltZXN0YW1wQnVpbGRlcigpO1xuICB9LFxuICAvKipcbiAgICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBjb2x1bW4gd2l0aCB0aGUge0BsaW5rIFRpbWVEdXJhdGlvbn0gdHlwZS5cbiAgICogWW91IGNhbiBjcmVhdGUgYSBjb2x1bW4gb2YgdGhlIHNhbWUgdHlwZSBieSBjb25zdHJ1Y3RpbmcgYW4gYG9iamVjdGAgd2l0aCBhIHNpbmdsZSBgX190aW1lX2R1cmF0aW9uX21pY3Jvc19fYCBlbGVtZW50LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBUaW1lRHVyYXRpb259IHR5cGUuXG4gICAqL1xuICB0aW1lRHVyYXRpb246ICgpID0+IHtcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkJ1aWxkZXIoKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBVdWlkfSB0eXBlLlxuICAgKiBZb3UgY2FuIGNyZWF0ZSBhIGNvbHVtbiBvZiB0aGUgc2FtZSB0eXBlIGJ5IGNvbnN0cnVjdGluZyBhbiBgb2JqZWN0YCB3aXRoIGEgc2luZ2xlIGBfX3V1aWRfX2AgZWxlbWVudC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFR5cGVCdWlsZGVyfSBpbnN0YW5jZSB3aXRoIHRoZSB7QGxpbmsgVXVpZH0gdHlwZS5cbiAgICovXG4gIHV1aWQ6ICgpID0+IHtcbiAgICByZXR1cm4gbmV3IFV1aWRCdWlsZGVyKCk7XG4gIH0sXG4gIC8qKlxuICAgKiBUaGlzIGlzIGEgY29udmVuaWVuY2UgbWV0aG9kIGZvciBjcmVhdGluZyBhIGNvbHVtbiB3aXRoIHRoZSBgQnl0ZUFycmF5YCB0eXBlLlxuICAgKiBZb3UgY2FuIGNyZWF0ZSBhIGNvbHVtbiBvZiB0aGUgc2FtZSB0eXBlIGJ5IGNvbnN0cnVjdGluZyBhbiBgYXJyYXlgIG9mIGB1OGAuXG4gICAqIFRoZSBUeXBlU2NyaXB0IHJlcHJlc2VudGF0aW9uIGlzIHtAbGluayBVaW50OEFycmF5fS5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEJ5dGVBcnJheUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIGBCeXRlQXJyYXlgIHR5cGUuXG4gICAqL1xuICBieXRlQXJyYXk6ICgpID0+IHtcbiAgICByZXR1cm4gbmV3IEJ5dGVBcnJheUJ1aWxkZXIoKTtcbiAgfVxufTtcbnZhciBNQVhfRU5WX0tFWV9CWVRFUyA9IDI1NjtcbnZhciBNQVhfRU5WX1ZBTFVFX0JZVEVTID0gOCAqIDEwMjQ7XG52YXIgTUFYX0VOVl9WQVJTID0gMjU2O1xudmFyIGVudmlyb25tZW50ID0gbmV3IFByb3h5KFxuICBPYmplY3QuZnJlZXplKFxuICAgIE9iamVjdC5hc3NpZ24oLyogQF9fUFVSRV9fICovIE9iamVjdC5jcmVhdGUobnVsbCksIHsgZ2V0OiAoa2V5KSA9PiBlbnZfZ2V0KGtleSkgfSlcbiAgKSxcbiAge1xuICAgIGdldCh0YXJnZXQsIGtleSkge1xuICAgICAgaWYgKGtleSA9PT0gXCJnZXRcIikgcmV0dXJuIHRhcmdldC5nZXQ7XG4gICAgICBpZiAodHlwZW9mIGtleSAhPT0gXCJzdHJpbmdcIikgcmV0dXJuIHZvaWQgMDtcbiAgICAgIHJldHVybiBlbnZfZ2V0KGtleSkgPz8gdm9pZCAwO1xuICAgIH1cbiAgfVxuKTtcbmZ1bmN0aW9uIGVudmlyb25tZW50RGVjbGFyYXRpb25zKHNjaGVtYTIpIHtcbiAgY29uc3QgZW50cmllcyA9IE9iamVjdC5lbnRyaWVzKHNjaGVtYTIpO1xuICBpZiAoZW50cmllcy5sZW5ndGggPiBNQVhfRU5WX1ZBUlMpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlRvbyBtYW55IGVudmlyb25tZW50IGRlY2xhcmF0aW9uc1wiKTtcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgcmV0dXJuIGVudHJpZXMubWFwKChbbmFtZSwgZGVmaW5pdGlvbl0pID0+IHtcbiAgICBpZiAoIS9eW0EtWmEtel9dW0EtWmEtejAtOV9dKiQvLnRlc3QobmFtZSkgfHwgYnl0ZXMuZW5jb2RlKG5hbWUpLmxlbmd0aCA+IE1BWF9FTlZfS0VZX0JZVEVTKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBlbnZpcm9ubWVudCBkZWNsYXJhdGlvbiBuYW1lXCIpO1xuICAgIH1cbiAgICBjb25zdCBvcHRpb25hbCA9IGRlZmluaXRpb24gaW5zdGFuY2VvZiBPcHRpb25CdWlsZGVyO1xuICAgIGNvbnN0IGlubmVyID0gb3B0aW9uYWwgPyBkZWZpbml0aW9uLnZhbHVlIDogZGVmaW5pdGlvbjtcbiAgICBsZXQgdHk7XG4gICAgaWYgKGlubmVyIGluc3RhbmNlb2YgU3RyaW5nQnVpbGRlcikge1xuICAgICAgdHkgPSB7IHRhZzogXCJTdHJpbmdcIiB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0eXBlID0gaW5uZXI/LmFsZ2VicmFpY1R5cGU7XG4gICAgICBpZiAodHlwZT8udGFnICE9PSBcIlN1bVwiIHx8ICEoXCJ2YXJpYW50c1wiIGluIGlubmVyKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIGBFbnZpcm9ubWVudCAnJHtuYW1lfScgbXVzdCBiZSBhIHN0cmluZyBvciBzaW1wbGUgZW51bWBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHZhbHVlcyA9IHR5cGUudmFsdWUudmFyaWFudHMubWFwKCh2YXJpYW50KSA9PiB7XG4gICAgICAgIGlmICh2YXJpYW50LmFsZ2VicmFpY1R5cGUudGFnICE9PSBcIlByb2R1Y3RcIiB8fCB2YXJpYW50LmFsZ2VicmFpY1R5cGUudmFsdWUuZWxlbWVudHMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgIGBFbnZpcm9ubWVudCAnJHtuYW1lfScgY2Fubm90IHVzZSBhbiBlbnVtIHBheWxvYWRgXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHZhcmlhbnQubmFtZSAhPT0gXCJzdHJpbmdcIilcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICAgYEVudmlyb25tZW50ICcke25hbWV9JyBlbnVtIGNhc2VzIG11c3QgaGF2ZSBuYW1lc2BcbiAgICAgICAgICApO1xuICAgICAgICBpZiAoYnl0ZXMuZW5jb2RlKHZhcmlhbnQubmFtZSkubGVuZ3RoID4gTUFYX0VOVl9WQUxVRV9CWVRFUylcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFbnZpcm9ubWVudCAnJHtuYW1lfScgbGl0ZXJhbCBpcyB0b28gbG9uZ2ApO1xuICAgICAgICByZXR1cm4gdmFyaWFudC5uYW1lO1xuICAgICAgfSk7XG4gICAgICBpZiAodmFsdWVzLmxlbmd0aCA9PT0gMCB8fCBuZXcgU2V0KHZhbHVlcykuc2l6ZSAhPT0gdmFsdWVzLmxlbmd0aClcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBgRW52aXJvbm1lbnQgJyR7bmFtZX0nIG5lZWRzIGEgbm9uZW1wdHkgbGl0ZXJhbCB1bmlvbmBcbiAgICAgICAgKTtcbiAgICAgIHR5ID0gdmFsdWVzLmxlbmd0aCA9PT0gMSA/IHsgdGFnOiBcIlN0cmluZ0xpdGVyYWxcIiwgdmFsdWU6IHZhbHVlc1swXSB9IDogeyB0YWc6IFwiVW5pb25cIiwgdmFsdWU6IHZhbHVlcyB9O1xuICAgIH1cbiAgICByZXR1cm4geyBuYW1lLCB0eSwgb3B0aW9uYWwgfTtcbiAgfSk7XG59XG5cbi8vIHNyYy9saWIvYXV0b2dlbi90eXBlcy50c1xudmFyIEFsZ2VicmFpY1R5cGUyID0gdC5lbnVtKFwiQWxnZWJyYWljVHlwZVwiLCB7XG4gIFJlZjogdC51MzIoKSxcbiAgZ2V0IFN1bSgpIHtcbiAgICByZXR1cm4gU3VtVHlwZTI7XG4gIH0sXG4gIGdldCBQcm9kdWN0KCkge1xuICAgIHJldHVybiBQcm9kdWN0VHlwZTI7XG4gIH0sXG4gIGdldCBBcnJheSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XG4gIH0sXG4gIFN0cmluZzogdC51bml0KCksXG4gIEJvb2w6IHQudW5pdCgpLFxuICBJODogdC51bml0KCksXG4gIFU4OiB0LnVuaXQoKSxcbiAgSTE2OiB0LnVuaXQoKSxcbiAgVTE2OiB0LnVuaXQoKSxcbiAgSTMyOiB0LnVuaXQoKSxcbiAgVTMyOiB0LnVuaXQoKSxcbiAgSTY0OiB0LnVuaXQoKSxcbiAgVTY0OiB0LnVuaXQoKSxcbiAgSTEyODogdC51bml0KCksXG4gIFUxMjg6IHQudW5pdCgpLFxuICBJMjU2OiB0LnVuaXQoKSxcbiAgVTI1NjogdC51bml0KCksXG4gIEYzMjogdC51bml0KCksXG4gIEY2NDogdC51bml0KClcbn0pO1xudmFyIENhc2VDb252ZXJzaW9uUG9saWN5ID0gdC5lbnVtKFwiQ2FzZUNvbnZlcnNpb25Qb2xpY3lcIiwge1xuICBOb25lOiB0LnVuaXQoKSxcbiAgU25ha2VDYXNlOiB0LnVuaXQoKVxufSk7XG52YXIgRW52VmFyVHlwZSA9IHQuZW51bShcIkVudlZhclR5cGVcIiwge1xuICBTdHJpbmc6IHQudW5pdCgpLFxuICBTdHJpbmdMaXRlcmFsOiB0LnN0cmluZygpLFxuICBVbmlvbjogdC5hcnJheSh0LnN0cmluZygpKVxufSk7XG52YXIgRW52aXJvbm1lbnREZWNsYXJhdGlvbiA9IHQub2JqZWN0KFwiRW52aXJvbm1lbnREZWNsYXJhdGlvblwiLCB7XG4gIG5hbWU6IHQuc3RyaW5nKCksXG4gIGdldCB0eSgpIHtcbiAgICByZXR1cm4gRW52VmFyVHlwZTtcbiAgfSxcbiAgb3B0aW9uYWw6IHQuYm9vbCgpXG59KTtcbnZhciBFeHBsaWNpdE5hbWVFbnRyeSA9IHQuZW51bShcIkV4cGxpY2l0TmFtZUVudHJ5XCIsIHtcbiAgZ2V0IFRhYmxlKCkge1xuICAgIHJldHVybiBOYW1lTWFwcGluZztcbiAgfSxcbiAgZ2V0IEZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBOYW1lTWFwcGluZztcbiAgfSxcbiAgZ2V0IEluZGV4KCkge1xuICAgIHJldHVybiBOYW1lTWFwcGluZztcbiAgfSxcbiAgZ2V0IE5hbWVzcGFjZSgpIHtcbiAgICByZXR1cm4gTmFtZU1hcHBpbmc7XG4gIH1cbn0pO1xudmFyIEV4cGxpY2l0TmFtZXMgPSB0Lm9iamVjdChcIkV4cGxpY2l0TmFtZXNcIiwge1xuICBnZXQgZW50cmllcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShFeHBsaWNpdE5hbWVFbnRyeSk7XG4gIH1cbn0pO1xudmFyIEZ1bmN0aW9uVmlzaWJpbGl0eSA9IHQuZW51bShcIkZ1bmN0aW9uVmlzaWJpbGl0eVwiLCB7XG4gIFByaXZhdGU6IHQudW5pdCgpLFxuICBDbGllbnRDYWxsYWJsZTogdC51bml0KClcbn0pO1xudmFyIEh0dHBIZWFkZXJQYWlyID0gdC5vYmplY3QoXCJIdHRwSGVhZGVyUGFpclwiLCB7XG4gIG5hbWU6IHQuc3RyaW5nKCksXG4gIHZhbHVlOiB0LmJ5dGVBcnJheSgpXG59KTtcbnZhciBIdHRwSGVhZGVycyA9IHQub2JqZWN0KFwiSHR0cEhlYWRlcnNcIiwge1xuICBnZXQgZW50cmllcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShIdHRwSGVhZGVyUGFpcik7XG4gIH1cbn0pO1xudmFyIEh0dHBNZXRob2QgPSB0LmVudW0oXCJIdHRwTWV0aG9kXCIsIHtcbiAgR2V0OiB0LnVuaXQoKSxcbiAgSGVhZDogdC51bml0KCksXG4gIFBvc3Q6IHQudW5pdCgpLFxuICBQdXQ6IHQudW5pdCgpLFxuICBEZWxldGU6IHQudW5pdCgpLFxuICBDb25uZWN0OiB0LnVuaXQoKSxcbiAgT3B0aW9uczogdC51bml0KCksXG4gIFRyYWNlOiB0LnVuaXQoKSxcbiAgUGF0Y2g6IHQudW5pdCgpLFxuICBFeHRlbnNpb246IHQuc3RyaW5nKClcbn0pO1xudmFyIEh0dHBSZXF1ZXN0ID0gdC5vYmplY3QoXCJIdHRwUmVxdWVzdFwiLCB7XG4gIGdldCBtZXRob2QoKSB7XG4gICAgcmV0dXJuIEh0dHBNZXRob2Q7XG4gIH0sXG4gIGdldCBoZWFkZXJzKCkge1xuICAgIHJldHVybiBIdHRwSGVhZGVycztcbiAgfSxcbiAgdGltZW91dDogdC5vcHRpb24odC50aW1lRHVyYXRpb24oKSksXG4gIHVyaTogdC5zdHJpbmcoKSxcbiAgZ2V0IHZlcnNpb24oKSB7XG4gICAgcmV0dXJuIEh0dHBWZXJzaW9uO1xuICB9XG59KTtcbnZhciBIdHRwUmVzcG9uc2UgPSB0Lm9iamVjdChcIkh0dHBSZXNwb25zZVwiLCB7XG4gIGdldCBoZWFkZXJzKCkge1xuICAgIHJldHVybiBIdHRwSGVhZGVycztcbiAgfSxcbiAgZ2V0IHZlcnNpb24oKSB7XG4gICAgcmV0dXJuIEh0dHBWZXJzaW9uO1xuICB9LFxuICBjb2RlOiB0LnUxNigpXG59KTtcbnZhciBIdHRwVmVyc2lvbiA9IHQuZW51bShcIkh0dHBWZXJzaW9uXCIsIHtcbiAgSHR0cDA5OiB0LnVuaXQoKSxcbiAgSHR0cDEwOiB0LnVuaXQoKSxcbiAgSHR0cDExOiB0LnVuaXQoKSxcbiAgSHR0cDI6IHQudW5pdCgpLFxuICBIdHRwMzogdC51bml0KClcbn0pO1xudmFyIEluZGV4VHlwZSA9IHQuZW51bShcIkluZGV4VHlwZVwiLCB7XG4gIEJUcmVlOiB0LnVuaXQoKSxcbiAgSGFzaDogdC51bml0KClcbn0pO1xudmFyIExpZmVjeWNsZSA9IHQuZW51bShcIkxpZmVjeWNsZVwiLCB7XG4gIEluaXQ6IHQudW5pdCgpLFxuICBPbkNvbm5lY3Q6IHQudW5pdCgpLFxuICBPbkRpc2Nvbm5lY3Q6IHQudW5pdCgpXG59KTtcbnZhciBNZXRob2RPckFueSA9IHQuZW51bShcIk1ldGhvZE9yQW55XCIsIHtcbiAgQW55OiB0LnVuaXQoKSxcbiAgZ2V0IE1ldGhvZCgpIHtcbiAgICByZXR1cm4gSHR0cE1ldGhvZDtcbiAgfVxufSk7XG52YXIgTWlzY01vZHVsZUV4cG9ydCA9IHQuZW51bShcIk1pc2NNb2R1bGVFeHBvcnRcIiwge1xuICBnZXQgVHlwZUFsaWFzKCkge1xuICAgIHJldHVybiBUeXBlQWxpYXM7XG4gIH1cbn0pO1xudmFyIE5hbWVNYXBwaW5nID0gdC5vYmplY3QoXCJOYW1lTWFwcGluZ1wiLCB7XG4gIHNvdXJjZU5hbWU6IHQuc3RyaW5nKCksXG4gIGNhbm9uaWNhbE5hbWU6IHQuc3RyaW5nKClcbn0pO1xudmFyIFByb2R1Y3RUeXBlMiA9IHQub2JqZWN0KFwiUHJvZHVjdFR5cGVcIiwge1xuICBnZXQgZWxlbWVudHMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUHJvZHVjdFR5cGVFbGVtZW50KTtcbiAgfVxufSk7XG52YXIgUHJvZHVjdFR5cGVFbGVtZW50ID0gdC5vYmplY3QoXCJQcm9kdWN0VHlwZUVsZW1lbnRcIiwge1xuICBuYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgZ2V0IGFsZ2VicmFpY1R5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xuICB9XG59KTtcbnZhciBSYXdDb2x1bW5EZWZWOCA9IHQub2JqZWN0KFwiUmF3Q29sdW1uRGVmVjhcIiwge1xuICBjb2xOYW1lOiB0LnN0cmluZygpLFxuICBnZXQgY29sVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XG4gIH1cbn0pO1xudmFyIFJhd0NvbHVtbkRlZmF1bHRWYWx1ZVYxMCA9IHQub2JqZWN0KFwiUmF3Q29sdW1uRGVmYXVsdFZhbHVlVjEwXCIsIHtcbiAgY29sSWQ6IHQudTE2KCksXG4gIHZhbHVlOiB0LmJ5dGVBcnJheSgpXG59KTtcbnZhciBSYXdDb2x1bW5EZWZhdWx0VmFsdWVWOSA9IHQub2JqZWN0KFwiUmF3Q29sdW1uRGVmYXVsdFZhbHVlVjlcIiwge1xuICB0YWJsZTogdC5zdHJpbmcoKSxcbiAgY29sSWQ6IHQudTE2KCksXG4gIHZhbHVlOiB0LmJ5dGVBcnJheSgpXG59KTtcbnZhciBSYXdDb25zdHJhaW50RGF0YVY5ID0gdC5lbnVtKFwiUmF3Q29uc3RyYWludERhdGFWOVwiLCB7XG4gIGdldCBVbmlxdWUoKSB7XG4gICAgcmV0dXJuIFJhd1VuaXF1ZUNvbnN0cmFpbnREYXRhVjk7XG4gIH1cbn0pO1xudmFyIFJhd0NvbnN0cmFpbnREZWZWMTAgPSB0Lm9iamVjdChcIlJhd0NvbnN0cmFpbnREZWZWMTBcIiwge1xuICBzb3VyY2VOYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgZ2V0IGRhdGEoKSB7XG4gICAgcmV0dXJuIFJhd0NvbnN0cmFpbnREYXRhVjk7XG4gIH1cbn0pO1xudmFyIFJhd0NvbnN0cmFpbnREZWZWOCA9IHQub2JqZWN0KFwiUmF3Q29uc3RyYWludERlZlY4XCIsIHtcbiAgY29uc3RyYWludE5hbWU6IHQuc3RyaW5nKCksXG4gIGNvbnN0cmFpbnRzOiB0LnU4KCksXG4gIGNvbHVtbnM6IHQuYXJyYXkodC51MTYoKSlcbn0pO1xudmFyIFJhd0NvbnN0cmFpbnREZWZWOSA9IHQub2JqZWN0KFwiUmF3Q29uc3RyYWludERlZlY5XCIsIHtcbiAgbmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXG4gIGdldCBkYXRhKCkge1xuICAgIHJldHVybiBSYXdDb25zdHJhaW50RGF0YVY5O1xuICB9XG59KTtcbnZhciBSYXdIdHRwSGFuZGxlckRlZlYxMCA9IHQub2JqZWN0KFwiUmF3SHR0cEhhbmRsZXJEZWZWMTBcIiwge1xuICBzb3VyY2VOYW1lOiB0LnN0cmluZygpXG59KTtcbnZhciBSYXdIdHRwUm91dGVEZWZWMTAgPSB0Lm9iamVjdChcIlJhd0h0dHBSb3V0ZURlZlYxMFwiLCB7XG4gIGhhbmRsZXJGdW5jdGlvbjogdC5zdHJpbmcoKSxcbiAgZ2V0IG1ldGhvZCgpIHtcbiAgICByZXR1cm4gTWV0aG9kT3JBbnk7XG4gIH0sXG4gIHBhdGg6IHQuc3RyaW5nKClcbn0pO1xudmFyIFJhd0luZGV4QWxnb3JpdGhtID0gdC5lbnVtKFwiUmF3SW5kZXhBbGdvcml0aG1cIiwge1xuICBCVHJlZTogdC5hcnJheSh0LnUxNigpKSxcbiAgSGFzaDogdC5hcnJheSh0LnUxNigpKSxcbiAgRGlyZWN0OiB0LnUxNigpXG59KTtcbnZhciBSYXdJbmRleERlZlYxMCA9IHQub2JqZWN0KFwiUmF3SW5kZXhEZWZWMTBcIiwge1xuICBzb3VyY2VOYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgYWNjZXNzb3JOYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgZ2V0IGFsZ29yaXRobSgpIHtcbiAgICByZXR1cm4gUmF3SW5kZXhBbGdvcml0aG07XG4gIH1cbn0pO1xudmFyIFJhd0luZGV4RGVmVjggPSB0Lm9iamVjdChcIlJhd0luZGV4RGVmVjhcIiwge1xuICBpbmRleE5hbWU6IHQuc3RyaW5nKCksXG4gIGlzVW5pcXVlOiB0LmJvb2woKSxcbiAgZ2V0IGluZGV4VHlwZSgpIHtcbiAgICByZXR1cm4gSW5kZXhUeXBlO1xuICB9LFxuICBjb2x1bW5zOiB0LmFycmF5KHQudTE2KCkpXG59KTtcbnZhciBSYXdJbmRleERlZlY5ID0gdC5vYmplY3QoXCJSYXdJbmRleERlZlY5XCIsIHtcbiAgbmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXG4gIGFjY2Vzc29yTmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXG4gIGdldCBhbGdvcml0aG0oKSB7XG4gICAgcmV0dXJuIFJhd0luZGV4QWxnb3JpdGhtO1xuICB9XG59KTtcbnZhciBSYXdMaWZlQ3ljbGVSZWR1Y2VyRGVmVjEwID0gdC5vYmplY3QoXG4gIFwiUmF3TGlmZUN5Y2xlUmVkdWNlckRlZlYxMFwiLFxuICB7XG4gICAgZ2V0IGxpZmVjeWNsZVNwZWMoKSB7XG4gICAgICByZXR1cm4gTGlmZWN5Y2xlO1xuICAgIH0sXG4gICAgZnVuY3Rpb25OYW1lOiB0LnN0cmluZygpXG4gIH1cbik7XG52YXIgUmF3TWlzY01vZHVsZUV4cG9ydFY5ID0gdC5lbnVtKFwiUmF3TWlzY01vZHVsZUV4cG9ydFY5XCIsIHtcbiAgZ2V0IENvbHVtbkRlZmF1bHRWYWx1ZSgpIHtcbiAgICByZXR1cm4gUmF3Q29sdW1uRGVmYXVsdFZhbHVlVjk7XG4gIH0sXG4gIGdldCBQcm9jZWR1cmUoKSB7XG4gICAgcmV0dXJuIFJhd1Byb2NlZHVyZURlZlY5O1xuICB9LFxuICBnZXQgVmlldygpIHtcbiAgICByZXR1cm4gUmF3Vmlld0RlZlY5O1xuICB9XG59KTtcbnZhciBSYXdNb2R1bGVEZWYgPSB0LmVudW0oXCJSYXdNb2R1bGVEZWZcIiwge1xuICBnZXQgVjhCYWNrQ29tcGF0KCkge1xuICAgIHJldHVybiBSYXdNb2R1bGVEZWZWODtcbiAgfSxcbiAgZ2V0IFY5KCkge1xuICAgIHJldHVybiBSYXdNb2R1bGVEZWZWOTtcbiAgfSxcbiAgZ2V0IFYxMCgpIHtcbiAgICByZXR1cm4gUmF3TW9kdWxlRGVmVjEwO1xuICB9XG59KTtcbnZhciBSYXdNb2R1bGVEZWZWMTAgPSB0Lm9iamVjdChcIlJhd01vZHVsZURlZlYxMFwiLCB7XG4gIGdldCBzZWN0aW9ucygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdNb2R1bGVEZWZWMTBTZWN0aW9uKTtcbiAgfVxufSk7XG52YXIgUmF3TW9kdWxlRGVmVjEwU2VjdGlvbiA9IHQuZW51bShcIlJhd01vZHVsZURlZlYxMFNlY3Rpb25cIiwge1xuICBnZXQgVHlwZXNwYWNlKCkge1xuICAgIHJldHVybiBUeXBlc3BhY2U7XG4gIH0sXG4gIGdldCBUeXBlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdUeXBlRGVmVjEwKTtcbiAgfSxcbiAgZ2V0IFRhYmxlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdUYWJsZURlZlYxMCk7XG4gIH0sXG4gIGdldCBSZWR1Y2VycygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdSZWR1Y2VyRGVmVjEwKTtcbiAgfSxcbiAgZ2V0IFByb2NlZHVyZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3UHJvY2VkdXJlRGVmVjEwKTtcbiAgfSxcbiAgZ2V0IFZpZXdzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1ZpZXdEZWZWMTApO1xuICB9LFxuICBnZXQgU2NoZWR1bGVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1NjaGVkdWxlRGVmVjEwKTtcbiAgfSxcbiAgZ2V0IExpZmVDeWNsZVJlZHVjZXJzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd0xpZmVDeWNsZVJlZHVjZXJEZWZWMTApO1xuICB9LFxuICBnZXQgUm93TGV2ZWxTZWN1cml0eSgpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdSb3dMZXZlbFNlY3VyaXR5RGVmVjkpO1xuICB9LFxuICBnZXQgQ2FzZUNvbnZlcnNpb25Qb2xpY3koKSB7XG4gICAgcmV0dXJuIENhc2VDb252ZXJzaW9uUG9saWN5O1xuICB9LFxuICBnZXQgRXhwbGljaXROYW1lcygpIHtcbiAgICByZXR1cm4gRXhwbGljaXROYW1lcztcbiAgfSxcbiAgZ2V0IEh0dHBIYW5kbGVycygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdIdHRwSGFuZGxlckRlZlYxMCk7XG4gIH0sXG4gIGdldCBIdHRwUm91dGVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd0h0dHBSb3V0ZURlZlYxMCk7XG4gIH0sXG4gIGdldCBWaWV3UHJpbWFyeUtleXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3Vmlld1ByaW1hcnlLZXlEZWZWMTApO1xuICB9LFxuICBnZXQgU3VibW9kdWxlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdTdWJtb2R1bGVWMTApO1xuICB9LFxuICBnZXQgRW52aXJvbm1lbnQoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoRW52aXJvbm1lbnREZWNsYXJhdGlvbik7XG4gIH1cbn0pO1xudmFyIFJhd01vZHVsZURlZlY4ID0gdC5vYmplY3QoXCJSYXdNb2R1bGVEZWZWOFwiLCB7XG4gIGdldCB0eXBlc3BhY2UoKSB7XG4gICAgcmV0dXJuIFR5cGVzcGFjZTtcbiAgfSxcbiAgZ2V0IHRhYmxlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShUYWJsZURlc2MpO1xuICB9LFxuICBnZXQgcmVkdWNlcnMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmVkdWNlckRlZik7XG4gIH0sXG4gIGdldCBtaXNjRXhwb3J0cygpIHtcbiAgICByZXR1cm4gdC5hcnJheShNaXNjTW9kdWxlRXhwb3J0KTtcbiAgfVxufSk7XG52YXIgUmF3TW9kdWxlRGVmVjkgPSB0Lm9iamVjdChcIlJhd01vZHVsZURlZlY5XCIsIHtcbiAgZ2V0IHR5cGVzcGFjZSgpIHtcbiAgICByZXR1cm4gVHlwZXNwYWNlO1xuICB9LFxuICBnZXQgdGFibGVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1RhYmxlRGVmVjkpO1xuICB9LFxuICBnZXQgcmVkdWNlcnMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3UmVkdWNlckRlZlY5KTtcbiAgfSxcbiAgZ2V0IHR5cGVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1R5cGVEZWZWOSk7XG4gIH0sXG4gIGdldCBtaXNjRXhwb3J0cygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdNaXNjTW9kdWxlRXhwb3J0VjkpO1xuICB9LFxuICBnZXQgcm93TGV2ZWxTZWN1cml0eSgpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdSb3dMZXZlbFNlY3VyaXR5RGVmVjkpO1xuICB9XG59KTtcbnZhciBSYXdQcm9jZWR1cmVEZWZWMTAgPSB0Lm9iamVjdChcIlJhd1Byb2NlZHVyZURlZlYxMFwiLCB7XG4gIHNvdXJjZU5hbWU6IHQuc3RyaW5nKCksXG4gIGdldCBwYXJhbXMoKSB7XG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlMjtcbiAgfSxcbiAgZ2V0IHJldHVyblR5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xuICB9LFxuICBnZXQgdmlzaWJpbGl0eSgpIHtcbiAgICByZXR1cm4gRnVuY3Rpb25WaXNpYmlsaXR5O1xuICB9XG59KTtcbnZhciBSYXdQcm9jZWR1cmVEZWZWOSA9IHQub2JqZWN0KFwiUmF3UHJvY2VkdXJlRGVmVjlcIiwge1xuICBuYW1lOiB0LnN0cmluZygpLFxuICBnZXQgcGFyYW1zKCkge1xuICAgIHJldHVybiBQcm9kdWN0VHlwZTI7XG4gIH0sXG4gIGdldCByZXR1cm5UeXBlKCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcbiAgfVxufSk7XG52YXIgUmF3UmVkdWNlckRlZlYxMCA9IHQub2JqZWN0KFwiUmF3UmVkdWNlckRlZlYxMFwiLCB7XG4gIHNvdXJjZU5hbWU6IHQuc3RyaW5nKCksXG4gIGdldCBwYXJhbXMoKSB7XG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlMjtcbiAgfSxcbiAgZ2V0IHZpc2liaWxpdHkoKSB7XG4gICAgcmV0dXJuIEZ1bmN0aW9uVmlzaWJpbGl0eTtcbiAgfSxcbiAgZ2V0IG9rUmV0dXJuVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XG4gIH0sXG4gIGdldCBlcnJSZXR1cm5UeXBlKCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcbiAgfVxufSk7XG52YXIgUmF3UmVkdWNlckRlZlY5ID0gdC5vYmplY3QoXCJSYXdSZWR1Y2VyRGVmVjlcIiwge1xuICBuYW1lOiB0LnN0cmluZygpLFxuICBnZXQgcGFyYW1zKCkge1xuICAgIHJldHVybiBQcm9kdWN0VHlwZTI7XG4gIH0sXG4gIGdldCBsaWZlY3ljbGUoKSB7XG4gICAgcmV0dXJuIHQub3B0aW9uKExpZmVjeWNsZSk7XG4gIH1cbn0pO1xudmFyIFJhd1Jvd0xldmVsU2VjdXJpdHlEZWZWOSA9IHQub2JqZWN0KFwiUmF3Um93TGV2ZWxTZWN1cml0eURlZlY5XCIsIHtcbiAgc3FsOiB0LnN0cmluZygpXG59KTtcbnZhciBSYXdTY2hlZHVsZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3U2NoZWR1bGVEZWZWMTBcIiwge1xuICBzb3VyY2VOYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgdGFibGVOYW1lOiB0LnN0cmluZygpLFxuICBzY2hlZHVsZUF0Q29sOiB0LnUxNigpLFxuICBmdW5jdGlvbk5hbWU6IHQuc3RyaW5nKClcbn0pO1xudmFyIFJhd1NjaGVkdWxlRGVmVjkgPSB0Lm9iamVjdChcIlJhd1NjaGVkdWxlRGVmVjlcIiwge1xuICBuYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgcmVkdWNlck5hbWU6IHQuc3RyaW5nKCksXG4gIHNjaGVkdWxlZEF0Q29sdW1uOiB0LnUxNigpXG59KTtcbnZhciBSYXdTY29wZWRUeXBlTmFtZVYxMCA9IHQub2JqZWN0KFwiUmF3U2NvcGVkVHlwZU5hbWVWMTBcIiwge1xuICBzY29wZTogdC5hcnJheSh0LnN0cmluZygpKSxcbiAgc291cmNlTmFtZTogdC5zdHJpbmcoKVxufSk7XG52YXIgUmF3U2NvcGVkVHlwZU5hbWVWOSA9IHQub2JqZWN0KFwiUmF3U2NvcGVkVHlwZU5hbWVWOVwiLCB7XG4gIHNjb3BlOiB0LmFycmF5KHQuc3RyaW5nKCkpLFxuICBuYW1lOiB0LnN0cmluZygpXG59KTtcbnZhciBSYXdTZXF1ZW5jZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3U2VxdWVuY2VEZWZWMTBcIiwge1xuICBzb3VyY2VOYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgY29sdW1uOiB0LnUxNigpLFxuICBzdGFydDogdC5vcHRpb24odC5pMTI4KCkpLFxuICBtaW5WYWx1ZTogdC5vcHRpb24odC5pMTI4KCkpLFxuICBtYXhWYWx1ZTogdC5vcHRpb24odC5pMTI4KCkpLFxuICBpbmNyZW1lbnQ6IHQuaTEyOCgpXG59KTtcbnZhciBSYXdTZXF1ZW5jZURlZlY4ID0gdC5vYmplY3QoXCJSYXdTZXF1ZW5jZURlZlY4XCIsIHtcbiAgc2VxdWVuY2VOYW1lOiB0LnN0cmluZygpLFxuICBjb2xQb3M6IHQudTE2KCksXG4gIGluY3JlbWVudDogdC5pMTI4KCksXG4gIHN0YXJ0OiB0Lm9wdGlvbih0LmkxMjgoKSksXG4gIG1pblZhbHVlOiB0Lm9wdGlvbih0LmkxMjgoKSksXG4gIG1heFZhbHVlOiB0Lm9wdGlvbih0LmkxMjgoKSksXG4gIGFsbG9jYXRlZDogdC5pMTI4KClcbn0pO1xudmFyIFJhd1NlcXVlbmNlRGVmVjkgPSB0Lm9iamVjdChcIlJhd1NlcXVlbmNlRGVmVjlcIiwge1xuICBuYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgY29sdW1uOiB0LnUxNigpLFxuICBzdGFydDogdC5vcHRpb24odC5pMTI4KCkpLFxuICBtaW5WYWx1ZTogdC5vcHRpb24odC5pMTI4KCkpLFxuICBtYXhWYWx1ZTogdC5vcHRpb24odC5pMTI4KCkpLFxuICBpbmNyZW1lbnQ6IHQuaTEyOCgpXG59KTtcbnZhciBSYXdTdWJtb2R1bGVWMTAgPSB0Lm9iamVjdChcIlJhd1N1Ym1vZHVsZVYxMFwiLCB7XG4gIG5hbWVzcGFjZTogdC5zdHJpbmcoKSxcbiAgZ2V0IG1vZHVsZSgpIHtcbiAgICByZXR1cm4gUmF3TW9kdWxlRGVmVjEwO1xuICB9XG59KTtcbnZhciBSYXdUYWJsZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3VGFibGVEZWZWMTBcIiwge1xuICBzb3VyY2VOYW1lOiB0LnN0cmluZygpLFxuICBwcm9kdWN0VHlwZVJlZjogdC51MzIoKSxcbiAgcHJpbWFyeUtleTogdC5hcnJheSh0LnUxNigpKSxcbiAgZ2V0IGluZGV4ZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3SW5kZXhEZWZWMTApO1xuICB9LFxuICBnZXQgY29uc3RyYWludHMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3Q29uc3RyYWludERlZlYxMCk7XG4gIH0sXG4gIGdldCBzZXF1ZW5jZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3U2VxdWVuY2VEZWZWMTApO1xuICB9LFxuICBnZXQgdGFibGVUeXBlKCkge1xuICAgIHJldHVybiBUYWJsZVR5cGU7XG4gIH0sXG4gIGdldCB0YWJsZUFjY2VzcygpIHtcbiAgICByZXR1cm4gVGFibGVBY2Nlc3M7XG4gIH0sXG4gIGdldCBkZWZhdWx0VmFsdWVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd0NvbHVtbkRlZmF1bHRWYWx1ZVYxMCk7XG4gIH0sXG4gIGlzRXZlbnQ6IHQuYm9vbCgpXG59KTtcbnZhciBSYXdUYWJsZURlZlY4ID0gdC5vYmplY3QoXCJSYXdUYWJsZURlZlY4XCIsIHtcbiAgdGFibGVOYW1lOiB0LnN0cmluZygpLFxuICBnZXQgY29sdW1ucygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdDb2x1bW5EZWZWOCk7XG4gIH0sXG4gIGdldCBpbmRleGVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd0luZGV4RGVmVjgpO1xuICB9LFxuICBnZXQgY29uc3RyYWludHMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3Q29uc3RyYWludERlZlY4KTtcbiAgfSxcbiAgZ2V0IHNlcXVlbmNlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdTZXF1ZW5jZURlZlY4KTtcbiAgfSxcbiAgdGFibGVUeXBlOiB0LnN0cmluZygpLFxuICB0YWJsZUFjY2VzczogdC5zdHJpbmcoKSxcbiAgc2NoZWR1bGVkOiB0Lm9wdGlvbih0LnN0cmluZygpKVxufSk7XG52YXIgUmF3VGFibGVEZWZWOSA9IHQub2JqZWN0KFwiUmF3VGFibGVEZWZWOVwiLCB7XG4gIG5hbWU6IHQuc3RyaW5nKCksXG4gIHByb2R1Y3RUeXBlUmVmOiB0LnUzMigpLFxuICBwcmltYXJ5S2V5OiB0LmFycmF5KHQudTE2KCkpLFxuICBnZXQgaW5kZXhlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdJbmRleERlZlY5KTtcbiAgfSxcbiAgZ2V0IGNvbnN0cmFpbnRzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd0NvbnN0cmFpbnREZWZWOSk7XG4gIH0sXG4gIGdldCBzZXF1ZW5jZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3U2VxdWVuY2VEZWZWOSk7XG4gIH0sXG4gIGdldCBzY2hlZHVsZSgpIHtcbiAgICByZXR1cm4gdC5vcHRpb24oUmF3U2NoZWR1bGVEZWZWOSk7XG4gIH0sXG4gIGdldCB0YWJsZVR5cGUoKSB7XG4gICAgcmV0dXJuIFRhYmxlVHlwZTtcbiAgfSxcbiAgZ2V0IHRhYmxlQWNjZXNzKCkge1xuICAgIHJldHVybiBUYWJsZUFjY2VzcztcbiAgfVxufSk7XG52YXIgUmF3VHlwZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3VHlwZURlZlYxMFwiLCB7XG4gIGdldCBzb3VyY2VOYW1lKCkge1xuICAgIHJldHVybiBSYXdTY29wZWRUeXBlTmFtZVYxMDtcbiAgfSxcbiAgdHk6IHQudTMyKCksXG4gIGN1c3RvbU9yZGVyaW5nOiB0LmJvb2woKVxufSk7XG52YXIgUmF3VHlwZURlZlY5ID0gdC5vYmplY3QoXCJSYXdUeXBlRGVmVjlcIiwge1xuICBnZXQgbmFtZSgpIHtcbiAgICByZXR1cm4gUmF3U2NvcGVkVHlwZU5hbWVWOTtcbiAgfSxcbiAgdHk6IHQudTMyKCksXG4gIGN1c3RvbU9yZGVyaW5nOiB0LmJvb2woKVxufSk7XG52YXIgUmF3VW5pcXVlQ29uc3RyYWludERhdGFWOSA9IHQub2JqZWN0KFxuICBcIlJhd1VuaXF1ZUNvbnN0cmFpbnREYXRhVjlcIixcbiAge1xuICAgIGNvbHVtbnM6IHQuYXJyYXkodC51MTYoKSlcbiAgfVxuKTtcbnZhciBSYXdWaWV3RGVmVjEwID0gdC5vYmplY3QoXCJSYXdWaWV3RGVmVjEwXCIsIHtcbiAgc291cmNlTmFtZTogdC5zdHJpbmcoKSxcbiAgaW5kZXg6IHQudTMyKCksXG4gIGlzUHVibGljOiB0LmJvb2woKSxcbiAgaXNBbm9ueW1vdXM6IHQuYm9vbCgpLFxuICBnZXQgcGFyYW1zKCkge1xuICAgIHJldHVybiBQcm9kdWN0VHlwZTI7XG4gIH0sXG4gIGdldCByZXR1cm5UeXBlKCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcbiAgfVxufSk7XG52YXIgUmF3Vmlld0RlZlY5ID0gdC5vYmplY3QoXCJSYXdWaWV3RGVmVjlcIiwge1xuICBuYW1lOiB0LnN0cmluZygpLFxuICBpbmRleDogdC51MzIoKSxcbiAgaXNQdWJsaWM6IHQuYm9vbCgpLFxuICBpc0Fub255bW91czogdC5ib29sKCksXG4gIGdldCBwYXJhbXMoKSB7XG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlMjtcbiAgfSxcbiAgZ2V0IHJldHVyblR5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xuICB9XG59KTtcbnZhciBSYXdWaWV3UHJpbWFyeUtleURlZlYxMCA9IHQub2JqZWN0KFwiUmF3Vmlld1ByaW1hcnlLZXlEZWZWMTBcIiwge1xuICB2aWV3U291cmNlTmFtZTogdC5zdHJpbmcoKSxcbiAgY29sdW1uczogdC5hcnJheSh0LnN0cmluZygpKVxufSk7XG52YXIgUmVkdWNlckRlZiA9IHQub2JqZWN0KFwiUmVkdWNlckRlZlwiLCB7XG4gIG5hbWU6IHQuc3RyaW5nKCksXG4gIGdldCBhcmdzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFByb2R1Y3RUeXBlRWxlbWVudCk7XG4gIH1cbn0pO1xudmFyIFN1bVR5cGUyID0gdC5vYmplY3QoXCJTdW1UeXBlXCIsIHtcbiAgZ2V0IHZhcmlhbnRzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFN1bVR5cGVWYXJpYW50KTtcbiAgfVxufSk7XG52YXIgU3VtVHlwZVZhcmlhbnQgPSB0Lm9iamVjdChcIlN1bVR5cGVWYXJpYW50XCIsIHtcbiAgbmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXG4gIGdldCBhbGdlYnJhaWNUeXBlKCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcbiAgfVxufSk7XG52YXIgVGFibGVBY2Nlc3MgPSB0LmVudW0oXCJUYWJsZUFjY2Vzc1wiLCB7XG4gIFB1YmxpYzogdC51bml0KCksXG4gIFByaXZhdGU6IHQudW5pdCgpXG59KTtcbnZhciBUYWJsZURlc2MgPSB0Lm9iamVjdChcIlRhYmxlRGVzY1wiLCB7XG4gIGdldCBzY2hlbWEoKSB7XG4gICAgcmV0dXJuIFJhd1RhYmxlRGVmVjg7XG4gIH0sXG4gIGRhdGE6IHQudTMyKClcbn0pO1xudmFyIFRhYmxlVHlwZSA9IHQuZW51bShcIlRhYmxlVHlwZVwiLCB7XG4gIFN5c3RlbTogdC51bml0KCksXG4gIFVzZXI6IHQudW5pdCgpXG59KTtcbnZhciBUeXBlQWxpYXMgPSB0Lm9iamVjdChcIlR5cGVBbGlhc1wiLCB7XG4gIG5hbWU6IHQuc3RyaW5nKCksXG4gIHR5OiB0LnUzMigpXG59KTtcbnZhciBUeXBlc3BhY2UgPSB0Lm9iamVjdChcIlR5cGVzcGFjZVwiLCB7XG4gIGdldCB0eXBlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShBbGdlYnJhaWNUeXBlMik7XG4gIH1cbn0pO1xudmFyIFZpZXdSZXN1bHRIZWFkZXIgPSB0LmVudW0oXCJWaWV3UmVzdWx0SGVhZGVyXCIsIHtcbiAgUm93RGF0YTogdC51bml0KCksXG4gIFJhd1NxbDogdC5zdHJpbmcoKVxufSk7XG5cbi8vIHNyYy9saWIvc2NoZW1hLnRzXG5mdW5jdGlvbiB0YWJsZVRvU2NoZW1hKGFjY05hbWUsIHNjaGVtYTIsIHRhYmxlRGVmKSB7XG4gIGNvbnN0IGdldENvbE5hbWUgPSAoaSkgPT4gc2NoZW1hMi5yb3dUeXBlLmFsZ2VicmFpY1R5cGUudmFsdWUuZWxlbWVudHNbaV0ubmFtZTtcbiAgY29uc3QgcmVzb2x2ZWRJbmRleGVzID0gdGFibGVEZWYuaW5kZXhlcy5tYXAoXG4gICAgKGlkeCkgPT4ge1xuICAgICAgY29uc3QgYWNjZXNzb3JOYW1lID0gaWR4LmFjY2Vzc29yTmFtZTtcbiAgICAgIGlmICh0eXBlb2YgYWNjZXNzb3JOYW1lICE9PSBcInN0cmluZ1wiIHx8IGFjY2Vzc29yTmFtZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBgSW5kZXggJyR7aWR4LnNvdXJjZU5hbWUgPz8gXCI8dW5rbm93bj5cIn0nIG9uIHRhYmxlICcke3RhYmxlRGVmLnNvdXJjZU5hbWV9JyBpcyBtaXNzaW5nIGFjY2Vzc29yIG5hbWVgXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBjb25zdCBjb2x1bW5JZHMgPSBpZHguYWxnb3JpdGhtLnRhZyA9PT0gXCJEaXJlY3RcIiA/IFtpZHguYWxnb3JpdGhtLnZhbHVlXSA6IGlkeC5hbGdvcml0aG0udmFsdWU7XG4gICAgICBjb25zdCB1bmlxdWUgPSB0YWJsZURlZi5jb25zdHJhaW50cy5zb21lKFxuICAgICAgICAoYykgPT4gYy5kYXRhLnRhZyA9PT0gXCJVbmlxdWVcIiAmJiBjLmRhdGEudmFsdWUuY29sdW1ucy5ldmVyeSgoY29sKSA9PiBjb2x1bW5JZHMuaW5jbHVkZXMoY29sKSlcbiAgICAgICk7XG4gICAgICBjb25zdCBhbGdvcml0aG0gPSB7XG4gICAgICAgIEJUcmVlOiBcImJ0cmVlXCIsXG4gICAgICAgIEhhc2g6IFwiaGFzaFwiLFxuICAgICAgICBEaXJlY3Q6IFwiZGlyZWN0XCJcbiAgICAgIH1baWR4LmFsZ29yaXRobS50YWddO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogYWNjZXNzb3JOYW1lLFxuICAgICAgICB1bmlxdWUsXG4gICAgICAgIGFsZ29yaXRobSxcbiAgICAgICAgY29sdW1uczogY29sdW1uSWRzLm1hcChnZXRDb2xOYW1lKVxuICAgICAgfTtcbiAgICB9XG4gICk7XG4gIHJldHVybiB7XG4gICAgLy8gRm9yIGNsaWVudCxgc2NoYW1hLnRhYmxlTmFtZWAgd2lsbCBhbHdheXMgYmUgdGhlcmUgYXMgY2Fub25pY2FsIG5hbWUuXG4gICAgLy8gRm9yIG1vZHVsZSwgaWYgZXhwbGljaXQgbmFtZSBpcyBub3QgcHJvdmlkZWQgdmlhIGBuYW1lYCwgYWNjZXNzb3IgbmFtZSB3aWxsXG4gICAgLy8gYmUgdXNlZCwgaXQgaXMgc3RvcmVkIGFzIGFsaWFzIGluIGRhdGFiYXNlLCBoZW5jZSB3b3JrcyBpbiBxdWVyeSBidWlsZGVyLlxuICAgIHNvdXJjZU5hbWU6IHNjaGVtYTIudGFibGVOYW1lIHx8IGFjY05hbWUsXG4gICAgYWNjZXNzb3JOYW1lOiBhY2NOYW1lLFxuICAgIGNvbHVtbnM6IHNjaGVtYTIucm93VHlwZS5yb3csXG4gICAgLy8gdHlwZWQgYXMgVFtpXVsncm93VHlwZSddWydyb3cnXSB1bmRlciBUYWJsZXNUb1NjaGVtYTxUPlxuICAgIHJvd1R5cGU6IHNjaGVtYTIucm93U3BhY2V0aW1lVHlwZSxcbiAgICAvLyBLZWVwIGRlY2xhcmF0aXZlIGluZGV4ZXMgaW4gdGhlaXIgb3JpZ2luYWwgc2hhcGUgZm9yIHR5cGUtbGV2ZWwgY29uc3VtZXJzLlxuICAgIGluZGV4ZXM6IHNjaGVtYTIuaWR4cyxcbiAgICBjb25zdHJhaW50czogdGFibGVEZWYuY29uc3RyYWludHMubWFwKChjKSA9PiAoe1xuICAgICAgbmFtZTogYy5zb3VyY2VOYW1lLFxuICAgICAgY29uc3RyYWludDogXCJ1bmlxdWVcIixcbiAgICAgIGNvbHVtbnM6IGMuZGF0YS52YWx1ZS5jb2x1bW5zLm1hcChnZXRDb2xOYW1lKVxuICAgIH0pKSxcbiAgICAvLyBFeHBvc2UgcmVzb2x2ZWQgcnVudGltZSBpbmRleGVzIHNlcGFyYXRlbHkgc28gcnVudGltZSB1c2VycyBkb24ndCBoYXZlIHRvXG4gICAgLy8gcmVpbnRlcnByZXQgYGluZGV4ZXNgIHdpdGggdW5zYWZlIGNhc3RzLlxuICAgIHJlc29sdmVkSW5kZXhlcyxcbiAgICB0YWJsZURlZixcbiAgICAuLi50YWJsZURlZi5pc0V2ZW50ID8geyBpc0V2ZW50OiB0cnVlIH0gOiB7fVxuICB9O1xufVxudmFyIE1vZHVsZUNvbnRleHQgPSBjbGFzcyB7XG4gICNjb21wb3VuZFR5cGVzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgLyoqXG4gICAqIFRoZSBnbG9iYWwgbW9kdWxlIGRlZmluaXRpb24gdGhhdCBnZXRzIHBvcHVsYXRlZCBieSBjYWxscyB0byBgcmVkdWNlcigpYCBhbmQgbGlmZWN5Y2xlIGhvb2tzLlxuICAgKi9cbiAgI21vZHVsZURlZiA9IHtcbiAgICB0eXBlc3BhY2U6IHsgdHlwZXM6IFtdIH0sXG4gICAgdGFibGVzOiBbXSxcbiAgICByZWR1Y2VyczogW10sXG4gICAgdHlwZXM6IFtdLFxuICAgIHJvd0xldmVsU2VjdXJpdHk6IFtdLFxuICAgIHNjaGVkdWxlczogW10sXG4gICAgcHJvY2VkdXJlczogW10sXG4gICAgdmlld3M6IFtdLFxuICAgIHZpZXdQcmltYXJ5S2V5czogW10sXG4gICAgbGlmZUN5Y2xlUmVkdWNlcnM6IFtdLFxuICAgIGh0dHBIYW5kbGVyczogW10sXG4gICAgaHR0cFJvdXRlczogW10sXG4gICAgY2FzZUNvbnZlcnNpb25Qb2xpY3k6IHsgdGFnOiBcIlNuYWtlQ2FzZVwiIH0sXG4gICAgZXhwbGljaXROYW1lczoge1xuICAgICAgZW50cmllczogW11cbiAgICB9LFxuICAgIHN1Ym1vZHVsZXM6IFtdLFxuICAgIGVudmlyb25tZW50OiBbXVxuICB9O1xuICBnZXQgbW9kdWxlRGVmKCkge1xuICAgIHJldHVybiB0aGlzLiNtb2R1bGVEZWY7XG4gIH1cbiAgcmF3TW9kdWxlRGVmVjEwKCkge1xuICAgIGNvbnN0IHNlY3Rpb25zID0gW107XG4gICAgY29uc3QgcHVzaCA9IChzKSA9PiB7XG4gICAgICBpZiAocykgc2VjdGlvbnMucHVzaChzKTtcbiAgICB9O1xuICAgIGNvbnN0IG1vZHVsZSA9IHRoaXMuI21vZHVsZURlZjtcbiAgICBwdXNoKG1vZHVsZS50eXBlc3BhY2UgJiYgeyB0YWc6IFwiVHlwZXNwYWNlXCIsIHZhbHVlOiBtb2R1bGUudHlwZXNwYWNlIH0pO1xuICAgIHB1c2gobW9kdWxlLnR5cGVzICYmIHsgdGFnOiBcIlR5cGVzXCIsIHZhbHVlOiBtb2R1bGUudHlwZXMgfSk7XG4gICAgcHVzaChtb2R1bGUudGFibGVzICYmIHsgdGFnOiBcIlRhYmxlc1wiLCB2YWx1ZTogbW9kdWxlLnRhYmxlcyB9KTtcbiAgICBwdXNoKG1vZHVsZS5yZWR1Y2VycyAmJiB7IHRhZzogXCJSZWR1Y2Vyc1wiLCB2YWx1ZTogbW9kdWxlLnJlZHVjZXJzIH0pO1xuICAgIHB1c2gobW9kdWxlLnByb2NlZHVyZXMgJiYgeyB0YWc6IFwiUHJvY2VkdXJlc1wiLCB2YWx1ZTogbW9kdWxlLnByb2NlZHVyZXMgfSk7XG4gICAgcHVzaChtb2R1bGUudmlld3MgJiYgeyB0YWc6IFwiVmlld3NcIiwgdmFsdWU6IG1vZHVsZS52aWV3cyB9KTtcbiAgICBwdXNoKFxuICAgICAgbW9kdWxlLnZpZXdQcmltYXJ5S2V5cyAmJiB7XG4gICAgICAgIHRhZzogXCJWaWV3UHJpbWFyeUtleXNcIixcbiAgICAgICAgdmFsdWU6IG1vZHVsZS52aWV3UHJpbWFyeUtleXNcbiAgICAgIH1cbiAgICApO1xuICAgIHB1c2gobW9kdWxlLnNjaGVkdWxlcyAmJiB7IHRhZzogXCJTY2hlZHVsZXNcIiwgdmFsdWU6IG1vZHVsZS5zY2hlZHVsZXMgfSk7XG4gICAgcHVzaChcbiAgICAgIG1vZHVsZS5saWZlQ3ljbGVSZWR1Y2VycyAmJiB7XG4gICAgICAgIHRhZzogXCJMaWZlQ3ljbGVSZWR1Y2Vyc1wiLFxuICAgICAgICB2YWx1ZTogbW9kdWxlLmxpZmVDeWNsZVJlZHVjZXJzXG4gICAgICB9XG4gICAgKTtcbiAgICBwdXNoKFxuICAgICAgbW9kdWxlLmh0dHBIYW5kbGVycyAmJiB7XG4gICAgICAgIHRhZzogXCJIdHRwSGFuZGxlcnNcIixcbiAgICAgICAgdmFsdWU6IG1vZHVsZS5odHRwSGFuZGxlcnNcbiAgICAgIH1cbiAgICApO1xuICAgIHB1c2goXG4gICAgICBtb2R1bGUuaHR0cFJvdXRlcyAmJiB7XG4gICAgICAgIHRhZzogXCJIdHRwUm91dGVzXCIsXG4gICAgICAgIHZhbHVlOiBtb2R1bGUuaHR0cFJvdXRlc1xuICAgICAgfVxuICAgICk7XG4gICAgcHVzaChcbiAgICAgIG1vZHVsZS5yb3dMZXZlbFNlY3VyaXR5ICYmIHtcbiAgICAgICAgdGFnOiBcIlJvd0xldmVsU2VjdXJpdHlcIixcbiAgICAgICAgdmFsdWU6IG1vZHVsZS5yb3dMZXZlbFNlY3VyaXR5XG4gICAgICB9XG4gICAgKTtcbiAgICBwdXNoKFxuICAgICAgbW9kdWxlLmV4cGxpY2l0TmFtZXMgJiYge1xuICAgICAgICB0YWc6IFwiRXhwbGljaXROYW1lc1wiLFxuICAgICAgICB2YWx1ZTogbW9kdWxlLmV4cGxpY2l0TmFtZXNcbiAgICAgIH1cbiAgICApO1xuICAgIHB1c2goXG4gICAgICBtb2R1bGUuY2FzZUNvbnZlcnNpb25Qb2xpY3kgJiYge1xuICAgICAgICB0YWc6IFwiQ2FzZUNvbnZlcnNpb25Qb2xpY3lcIixcbiAgICAgICAgdmFsdWU6IG1vZHVsZS5jYXNlQ29udmVyc2lvblBvbGljeVxuICAgICAgfVxuICAgICk7XG4gICAgcHVzaChcbiAgICAgIG1vZHVsZS5zdWJtb2R1bGVzICYmIHtcbiAgICAgICAgdGFnOiBcIlN1Ym1vZHVsZXNcIixcbiAgICAgICAgdmFsdWU6IG1vZHVsZS5zdWJtb2R1bGVzXG4gICAgICB9XG4gICAgKTtcbiAgICBwdXNoKHsgdGFnOiBcIkVudmlyb25tZW50XCIsIHZhbHVlOiBtb2R1bGUuZW52aXJvbm1lbnQgfSk7XG4gICAgcmV0dXJuIHsgc2VjdGlvbnMgfTtcbiAgfVxuICBhZGRTdWJtb2R1bGUoc3VibW9kdWxlKSB7XG4gICAgdGhpcy4jbW9kdWxlRGVmLnN1Ym1vZHVsZXMucHVzaChzdWJtb2R1bGUpO1xuICB9XG4gIC8qKlxuICAgKiBTZXQgdGhlIGNhc2UgY29udmVyc2lvbiBwb2xpY3kgZm9yIHRoaXMgbW9kdWxlLlxuICAgKiBDYWxsZWQgYnkgdGhlIHNldHRpbmdzIG1lY2hhbmlzbS5cbiAgICovXG4gIHNldENhc2VDb252ZXJzaW9uUG9saWN5KHBvbGljeSkge1xuICAgIHRoaXMuI21vZHVsZURlZi5jYXNlQ29udmVyc2lvblBvbGljeSA9IHBvbGljeTtcbiAgfVxuICBnZXQgdHlwZXNwYWNlKCkge1xuICAgIHJldHVybiB0aGlzLiNtb2R1bGVEZWYudHlwZXNwYWNlO1xuICB9XG4gIC8qKlxuICAgKiBSZXNvbHZlcyB0aGUgYWN0dWFsIHR5cGUgb2YgYSBUeXBlQnVpbGRlciBieSBmb2xsb3dpbmcgaXRzIHJlZmVyZW5jZXMgdW50aWwgaXQgcmVhY2hlcyBhIG5vbi1yZWYgdHlwZS5cbiAgICogQHBhcmFtIHR5cGVzcGFjZSBUaGUgdHlwZXNwYWNlIHRvIHJlc29sdmUgdHlwZXMgYWdhaW5zdC5cbiAgICogQHBhcmFtIHR5cGVCdWlsZGVyIFRoZSBUeXBlQnVpbGRlciB0byByZXNvbHZlLlxuICAgKiBAcmV0dXJucyBUaGUgcmVzb2x2ZWQgYWxnZWJyYWljIHR5cGUuXG4gICAqL1xuICByZXNvbHZlVHlwZSh0eXBlQnVpbGRlcikge1xuICAgIGxldCB0eSA9IHR5cGVCdWlsZGVyLmFsZ2VicmFpY1R5cGU7XG4gICAgd2hpbGUgKHR5LnRhZyA9PT0gXCJSZWZcIikge1xuICAgICAgdHkgPSB0aGlzLnR5cGVzcGFjZS50eXBlc1t0eS52YWx1ZV07XG4gICAgfVxuICAgIHJldHVybiB0eTtcbiAgfVxuICAvKipcbiAgICogQWRkcyBhIHR5cGUgdG8gdGhlIG1vZHVsZSBkZWZpbml0aW9uJ3MgdHlwZXNwYWNlIGFzIGEgYFJlZmAgaWYgaXQgaXMgYSBuYW1lZCBjb21wb3VuZCB0eXBlIChQcm9kdWN0IG9yIFN1bSkuXG4gICAqIE90aGVyd2lzZSwgcmV0dXJucyB0aGUgdHlwZSBhcyBpcy5cbiAgICogQHBhcmFtIG5hbWVcbiAgICogQHBhcmFtIHR5XG4gICAqIEByZXR1cm5zXG4gICAqL1xuICByZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkodHlwZUJ1aWxkZXIpIHtcbiAgICBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBQcm9kdWN0QnVpbGRlciAmJiAhaXNVbml0KHR5cGVCdWlsZGVyKSB8fCB0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFN1bUJ1aWxkZXIgfHwgdHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBSb3dCdWlsZGVyKSB7XG4gICAgICByZXR1cm4gdGhpcy4jcmVnaXN0ZXJDb21wb3VuZFR5cGVSZWN1cnNpdmVseSh0eXBlQnVpbGRlcik7XG4gICAgfSBlbHNlIGlmICh0eXBlQnVpbGRlciBpbnN0YW5jZW9mIE9wdGlvbkJ1aWxkZXIpIHtcbiAgICAgIHJldHVybiBuZXcgT3B0aW9uQnVpbGRlcihcbiAgICAgICAgdGhpcy5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkodHlwZUJ1aWxkZXIudmFsdWUpXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBSZXN1bHRCdWlsZGVyKSB7XG4gICAgICByZXR1cm4gbmV3IFJlc3VsdEJ1aWxkZXIoXG4gICAgICAgIHRoaXMucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHR5cGVCdWlsZGVyLm9rKSxcbiAgICAgICAgdGhpcy5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkodHlwZUJ1aWxkZXIuZXJyKVxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgQXJyYXlCdWlsZGVyKSB7XG4gICAgICByZXR1cm4gbmV3IEFycmF5QnVpbGRlcihcbiAgICAgICAgdGhpcy5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkodHlwZUJ1aWxkZXIuZWxlbWVudClcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0eXBlQnVpbGRlcjtcbiAgICB9XG4gIH1cbiAgI3JlZ2lzdGVyQ29tcG91bmRUeXBlUmVjdXJzaXZlbHkodHlwZUJ1aWxkZXIpIHtcbiAgICBjb25zdCB0eSA9IHR5cGVCdWlsZGVyLmFsZ2VicmFpY1R5cGU7XG4gICAgY29uc3QgbmFtZSA9IHR5cGVCdWlsZGVyLnR5cGVOYW1lO1xuICAgIGlmIChuYW1lID09PSB2b2lkIDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYE1pc3NpbmcgdHlwZSBuYW1lIGZvciAke3R5cGVCdWlsZGVyLmNvbnN0cnVjdG9yLm5hbWUgPz8gXCJUeXBlQnVpbGRlclwifSAke0pTT04uc3RyaW5naWZ5KHR5cGVCdWlsZGVyKX1gXG4gICAgICApO1xuICAgIH1cbiAgICBsZXQgciA9IHRoaXMuI2NvbXBvdW5kVHlwZXMuZ2V0KHR5KTtcbiAgICBpZiAociAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gcjtcbiAgICB9XG4gICAgY29uc3QgbmV3VHkgPSB0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFJvd0J1aWxkZXIgfHwgdHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBQcm9kdWN0QnVpbGRlciA/IHtcbiAgICAgIHRhZzogXCJQcm9kdWN0XCIsXG4gICAgICB2YWx1ZTogeyBlbGVtZW50czogW10gfVxuICAgIH0gOiB7XG4gICAgICB0YWc6IFwiU3VtXCIsXG4gICAgICB2YWx1ZTogeyB2YXJpYW50czogW10gfVxuICAgIH07XG4gICAgciA9IG5ldyBSZWZCdWlsZGVyKHRoaXMuI21vZHVsZURlZi50eXBlc3BhY2UudHlwZXMubGVuZ3RoKTtcbiAgICB0aGlzLiNtb2R1bGVEZWYudHlwZXNwYWNlLnR5cGVzLnB1c2gobmV3VHkpO1xuICAgIHRoaXMuI2NvbXBvdW5kVHlwZXMuc2V0KHR5LCByKTtcbiAgICBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBSb3dCdWlsZGVyKSB7XG4gICAgICBmb3IgKGNvbnN0IFtuYW1lMiwgZWxlbV0gb2YgT2JqZWN0LmVudHJpZXModHlwZUJ1aWxkZXIucm93KSkge1xuICAgICAgICBuZXdUeS52YWx1ZS5lbGVtZW50cy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBuYW1lMixcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseShlbGVtLnR5cGVCdWlsZGVyKS5hbGdlYnJhaWNUeXBlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBQcm9kdWN0QnVpbGRlcikge1xuICAgICAgZm9yIChjb25zdCBbbmFtZTIsIGVsZW1dIG9mIE9iamVjdC5lbnRyaWVzKHR5cGVCdWlsZGVyLmVsZW1lbnRzKSkge1xuICAgICAgICBuZXdUeS52YWx1ZS5lbGVtZW50cy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBuYW1lMixcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseShlbGVtKS5hbGdlYnJhaWNUeXBlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBTdW1CdWlsZGVyKSB7XG4gICAgICBmb3IgKGNvbnN0IFtuYW1lMiwgdmFyaWFudF0gb2YgT2JqZWN0LmVudHJpZXModHlwZUJ1aWxkZXIudmFyaWFudHMpKSB7XG4gICAgICAgIG5ld1R5LnZhbHVlLnZhcmlhbnRzLnB1c2goe1xuICAgICAgICAgIG5hbWU6IG5hbWUyLFxuICAgICAgICAgIGFsZ2VicmFpY1R5cGU6IHRoaXMucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHZhcmlhbnQpLmFsZ2VicmFpY1R5cGVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuI21vZHVsZURlZi50eXBlcy5wdXNoKHtcbiAgICAgIHNvdXJjZU5hbWU6IHNwbGl0TmFtZShuYW1lKSxcbiAgICAgIHR5OiByLnJlZixcbiAgICAgIGN1c3RvbU9yZGVyaW5nOiB0cnVlXG4gICAgfSk7XG4gICAgcmV0dXJuIHI7XG4gIH1cbn07XG5mdW5jdGlvbiBpc1VuaXQodHlwZUJ1aWxkZXIpIHtcbiAgcmV0dXJuIHR5cGVCdWlsZGVyLnR5cGVOYW1lID09IG51bGwgJiYgdHlwZUJ1aWxkZXIuYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50cy5sZW5ndGggPT09IDA7XG59XG5mdW5jdGlvbiBzcGxpdE5hbWUobmFtZSkge1xuICBjb25zdCBzY29wZSA9IG5hbWUuc3BsaXQoXCIuXCIpO1xuICByZXR1cm4geyBzb3VyY2VOYW1lOiBzY29wZS5wb3AoKSwgc2NvcGUgfTtcbn1cbnZhciB0ZXh0RW5jb2RlcjIgPSBuZXcgVGV4dEVuY29kZXIoKTtcbnZhciB0ZXh0RGVjb2RlcjIgPSBuZXcgVGV4dERlY29kZXIoXCJ1dGYtOFwiKTtcbmZ1bmN0aW9uIGRlc2VyaWFsaXplTWV0aG9kKG1ldGhvZCkge1xuICBzd2l0Y2ggKG1ldGhvZC50YWcpIHtcbiAgICBjYXNlIFwiR2V0XCI6XG4gICAgICByZXR1cm4gXCJHRVRcIjtcbiAgICBjYXNlIFwiSGVhZFwiOlxuICAgICAgcmV0dXJuIFwiSEVBRFwiO1xuICAgIGNhc2UgXCJQb3N0XCI6XG4gICAgICByZXR1cm4gXCJQT1NUXCI7XG4gICAgY2FzZSBcIlB1dFwiOlxuICAgICAgcmV0dXJuIFwiUFVUXCI7XG4gICAgY2FzZSBcIkRlbGV0ZVwiOlxuICAgICAgcmV0dXJuIFwiREVMRVRFXCI7XG4gICAgY2FzZSBcIkNvbm5lY3RcIjpcbiAgICAgIHJldHVybiBcIkNPTk5FQ1RcIjtcbiAgICBjYXNlIFwiT3B0aW9uc1wiOlxuICAgICAgcmV0dXJuIFwiT1BUSU9OU1wiO1xuICAgIGNhc2UgXCJUcmFjZVwiOlxuICAgICAgcmV0dXJuIFwiVFJBQ0VcIjtcbiAgICBjYXNlIFwiUGF0Y2hcIjpcbiAgICAgIHJldHVybiBcIlBBVENIXCI7XG4gICAgY2FzZSBcIkV4dGVuc2lvblwiOlxuICAgICAgcmV0dXJuIG1ldGhvZC52YWx1ZTtcbiAgfVxufVxudmFyIG1ldGhvZHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcChbXG4gIFtcIkdFVFwiLCB7IHRhZzogXCJHZXRcIiB9XSxcbiAgW1wiSEVBRFwiLCB7IHRhZzogXCJIZWFkXCIgfV0sXG4gIFtcIlBPU1RcIiwgeyB0YWc6IFwiUG9zdFwiIH1dLFxuICBbXCJQVVRcIiwgeyB0YWc6IFwiUHV0XCIgfV0sXG4gIFtcIkRFTEVURVwiLCB7IHRhZzogXCJEZWxldGVcIiB9XSxcbiAgW1wiQ09OTkVDVFwiLCB7IHRhZzogXCJDb25uZWN0XCIgfV0sXG4gIFtcIk9QVElPTlNcIiwgeyB0YWc6IFwiT3B0aW9uc1wiIH1dLFxuICBbXCJUUkFDRVwiLCB7IHRhZzogXCJUcmFjZVwiIH1dLFxuICBbXCJQQVRDSFwiLCB7IHRhZzogXCJQYXRjaFwiIH1dXG5dKTtcbmZ1bmN0aW9uIHNlcmlhbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgcmV0dXJuIG1ldGhvZHMuZ2V0KG1ldGhvZD8udG9VcHBlckNhc2UoKSA/PyBcIkdFVFwiKSA/PyB7XG4gICAgdGFnOiBcIkV4dGVuc2lvblwiLFxuICAgIHZhbHVlOiBtZXRob2RcbiAgfTtcbn1cbmZ1bmN0aW9uIHNlcmlhbGl6ZUhlYWRlcnMoaGVhZGVycykge1xuICByZXR1cm4ge1xuICAgIGVudHJpZXM6IEFycmF5LmZyb20oaGVhZGVycy5lbnRyaWVzKCksIChbbmFtZSwgdmFsdWVdKSA9PiAoe1xuICAgICAgbmFtZSxcbiAgICAgIHZhbHVlOiB0ZXh0RW5jb2RlcjIuZW5jb2RlKHZhbHVlKVxuICAgIH0pKVxuICB9O1xufVxuZnVuY3Rpb24gZGVzZXJpYWxpemVIZWFkZXJzKGhlYWRlcnMpIHtcbiAgcmV0dXJuIG5ldyBIZWFkZXJzKFxuICAgIGhlYWRlcnMuZW50cmllcy5tYXAoKHsgbmFtZSwgdmFsdWUgfSkgPT4gW1xuICAgICAgbmFtZSxcbiAgICAgIHRleHREZWNvZGVyMi5kZWNvZGUodmFsdWUpXG4gICAgXSlcbiAgKTtcbn1cbnZhciBtYWtlUmVzcG9uc2UgPSBTeW1ib2woXCJtYWtlUmVzcG9uc2VcIik7XG52YXIgU3luY1Jlc3BvbnNlID0gY2xhc3MgX1N5bmNSZXNwb25zZSB7XG4gICNib2R5O1xuICAjaW5uZXI7XG4gIGNvbnN0cnVjdG9yKGJvZHksIGluaXQpIHtcbiAgICBpZiAoYm9keSA9PSBudWxsKSB7XG4gICAgICB0aGlzLiNib2R5ID0gbnVsbDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBib2R5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aGlzLiNib2R5ID0gYm9keTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy4jYm9keSA9IG5ldyBVaW50OEFycmF5KGJvZHkpLmJ1ZmZlcjtcbiAgICB9XG4gICAgdGhpcy4jaW5uZXIgPSB7XG4gICAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyhpbml0Py5oZWFkZXJzKSxcbiAgICAgIHN0YXR1czogaW5pdD8uc3RhdHVzID8/IDIwMCxcbiAgICAgIHN0YXR1c1RleHQ6IGluaXQ/LnN0YXR1c1RleHQgPz8gXCJcIixcbiAgICAgIHR5cGU6IFwiZGVmYXVsdFwiLFxuICAgICAgdXJsOiBudWxsLFxuICAgICAgYWJvcnRlZDogZmFsc2UsXG4gICAgICB2ZXJzaW9uOiBpbml0Py52ZXJzaW9uID8/IHsgdGFnOiBcIkh0dHAxMVwiIH1cbiAgICB9O1xuICB9XG4gIHN0YXRpYyBbbWFrZVJlc3BvbnNlXShib2R5LCBpbm5lcikge1xuICAgIGNvbnN0IG1lID0gbmV3IF9TeW5jUmVzcG9uc2UoYm9keSk7XG4gICAgbWUuI2lubmVyID0gaW5uZXI7XG4gICAgcmV0dXJuIG1lO1xuICB9XG4gIGdldCBoZWFkZXJzKCkge1xuICAgIHJldHVybiB0aGlzLiNpbm5lci5oZWFkZXJzO1xuICB9XG4gIGdldCBzdGF0dXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2lubmVyLnN0YXR1cztcbiAgfVxuICBnZXQgc3RhdHVzVGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy4jaW5uZXIuc3RhdHVzVGV4dDtcbiAgfVxuICBnZXQgb2soKSB7XG4gICAgcmV0dXJuIDIwMCA8PSB0aGlzLiNpbm5lci5zdGF0dXMgJiYgdGhpcy4jaW5uZXIuc3RhdHVzIDw9IDI5OTtcbiAgfVxuICBnZXQgdXJsKCkge1xuICAgIHJldHVybiB0aGlzLiNpbm5lci51cmwgPz8gXCJcIjtcbiAgfVxuICBnZXQgdHlwZSgpIHtcbiAgICByZXR1cm4gdGhpcy4jaW5uZXIudHlwZTtcbiAgfVxuICBnZXQgdmVyc2lvbigpIHtcbiAgICByZXR1cm4gdGhpcy4jaW5uZXIudmVyc2lvbjtcbiAgfVxuICBhcnJheUJ1ZmZlcigpIHtcbiAgICByZXR1cm4gdGhpcy5ieXRlcygpLmJ1ZmZlcjtcbiAgfVxuICBieXRlcygpIHtcbiAgICBpZiAodGhpcy4jYm9keSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLiNib2R5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICByZXR1cm4gdGV4dEVuY29kZXIyLmVuY29kZSh0aGlzLiNib2R5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KHRoaXMuI2JvZHkpO1xuICAgIH1cbiAgfVxuICBqc29uKCkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKHRoaXMudGV4dCgpKTtcbiAgfVxuICB0ZXh0KCkge1xuICAgIGlmICh0aGlzLiNib2R5ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuI2JvZHkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLiNib2R5O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGV4dERlY29kZXIyLmRlY29kZSh0aGlzLiNib2R5KTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIHNyYy9zZXJ2ZXIvaHR0cF9oYW5kbGVycy50c1xudmFyIGh0dHBIYW5kbGVyRm4gPSBTeW1ib2woXCJTcGFjZXRpbWVEQi5odHRwSGFuZGxlckZuXCIpO1xudmFyIEFDQ0VQVEFCTEVfUk9VVEVfUEFUSF9DSEFSU19IVU1BTl9ERVNDUklQVElPTiA9IFwiQVNDSUkgbG93ZXJjYXNlIGxldHRlcnMsIGRpZ2l0cyBhbmQgYC1ffi9gXCI7XG52YXIgbWFrZVJlcXVlc3QgPSBTeW1ib2woXCJtYWtlUmVxdWVzdFwiKTtcbmZ1bmN0aW9uIGNvZXJjZVJlcXVlc3RCb2R5KGJvZHkpIHtcbiAgaWYgKGJvZHkgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmICh0eXBlb2YgYm9keSA9PT0gXCJzdHJpbmdcIikge1xuICAgIHJldHVybiBib2R5O1xuICB9XG4gIHJldHVybiBuZXcgVWludDhBcnJheShib2R5KTtcbn1cbmZ1bmN0aW9uIHJlcXVlc3RCb2R5VG9CeXRlcyhib2R5KSB7XG4gIGlmIChib2R5ID09IG51bGwpIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoKTtcbiAgfVxuICBpZiAodHlwZW9mIGJvZHkgPT09IFwic3RyaW5nXCIpIHtcbiAgICByZXR1cm4gdGV4dEVuY29kZXIyLmVuY29kZShib2R5KTtcbiAgfVxuICByZXR1cm4gYm9keTtcbn1cbmZ1bmN0aW9uIHJlcXVlc3RCb2R5VG9UZXh0KGJvZHkpIHtcbiAgaWYgKGJvZHkgPT0gbnVsbCkge1xuICAgIHJldHVybiBcIlwiO1xuICB9XG4gIGlmICh0eXBlb2YgYm9keSA9PT0gXCJzdHJpbmdcIikge1xuICAgIHJldHVybiBib2R5O1xuICB9XG4gIHJldHVybiB0ZXh0RGVjb2RlcjIuZGVjb2RlKGJvZHkpO1xufVxuZnVuY3Rpb24gY2hhcmFjdGVySXNBY2NlcHRhYmxlRm9yUm91dGVQYXRoKGMpIHtcbiAgcmV0dXJuIGMgPj0gXCJhXCIgJiYgYyA8PSBcInpcIiB8fCBjID49IFwiMFwiICYmIGMgPD0gXCI5XCIgfHwgYyA9PT0gXCItXCIgfHwgYyA9PT0gXCJfXCIgfHwgYyA9PT0gXCJ+XCIgfHwgYyA9PT0gXCIvXCI7XG59XG5mdW5jdGlvbiBhc3NlcnRWYWxpZFBhdGgocGF0aCkge1xuICBpZiAocGF0aCAhPT0gXCJcIiAmJiAhcGF0aC5zdGFydHNXaXRoKFwiL1wiKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFJvdXRlIHBhdGhzIG11c3Qgc3RhcnQgd2l0aCBcXGAvXFxgOiAke3BhdGh9YCk7XG4gIH1cbiAgaWYgKCFbLi4ucGF0aF0uZXZlcnkoY2hhcmFjdGVySXNBY2NlcHRhYmxlRm9yUm91dGVQYXRoKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICBgUm91dGUgcGF0aHMgbWF5IGNvbnRhaW4gb25seSAke0FDQ0VQVEFCTEVfUk9VVEVfUEFUSF9DSEFSU19IVU1BTl9ERVNDUklQVElPTn06ICR7cGF0aH1gXG4gICAgKTtcbiAgfVxufVxuZnVuY3Rpb24gcm91dGVzT3ZlcmxhcChhLCBiKSB7XG4gIGNvbnN0IG1ldGhvZHNNYXRjaCA9IChsZWZ0LCByaWdodCkgPT4ge1xuICAgIGlmIChsZWZ0LnRhZyAhPT0gcmlnaHQudGFnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChsZWZ0LnRhZyA9PT0gXCJFeHRlbnNpb25cIiAmJiByaWdodC50YWcgPT09IFwiRXh0ZW5zaW9uXCIpIHtcbiAgICAgIHJldHVybiBsZWZ0LnZhbHVlID09PSByaWdodC52YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIHJldHVybiBhLnBhdGggPT09IGIucGF0aCAmJiAoYS5tZXRob2QudGFnID09PSBcIkFueVwiIHx8IGIubWV0aG9kLnRhZyA9PT0gXCJBbnlcIiB8fCBhLm1ldGhvZC50YWcgPT09IFwiTWV0aG9kXCIgJiYgYi5tZXRob2QudGFnID09PSBcIk1ldGhvZFwiICYmIG1ldGhvZHNNYXRjaChhLm1ldGhvZC52YWx1ZSwgYi5tZXRob2QudmFsdWUpKTtcbn1cbmZ1bmN0aW9uIGpvaW5QYXRocyhwcmVmaXgsIHN1ZmZpeCkge1xuICBpZiAocHJlZml4ID09PSBcIi9cIikge1xuICAgIHJldHVybiBzdWZmaXg7XG4gIH1cbiAgaWYgKHN1ZmZpeCA9PT0gXCIvXCIpIHtcbiAgICByZXR1cm4gcHJlZml4O1xuICB9XG4gIGxldCBwcmVmaXhFbmQgPSBwcmVmaXgubGVuZ3RoO1xuICB3aGlsZSAocHJlZml4RW5kID4gMCAmJiBwcmVmaXhbcHJlZml4RW5kIC0gMV0gPT09IFwiL1wiKSB7XG4gICAgcHJlZml4RW5kLS07XG4gIH1cbiAgbGV0IHN1ZmZpeFN0YXJ0ID0gMDtcbiAgd2hpbGUgKHN1ZmZpeFN0YXJ0IDwgc3VmZml4Lmxlbmd0aCAmJiBzdWZmaXhbc3VmZml4U3RhcnRdID09PSBcIi9cIikge1xuICAgIHN1ZmZpeFN0YXJ0Kys7XG4gIH1cbiAgY29uc3Qgam9pbmVkUHJlZml4ID0gcHJlZml4LnNsaWNlKDAsIHByZWZpeEVuZCk7XG4gIGNvbnN0IGpvaW5lZFN1ZmZpeCA9IHN1ZmZpeC5zbGljZShzdWZmaXhTdGFydCk7XG4gIHJldHVybiBgJHtqb2luZWRQcmVmaXh9LyR7am9pbmVkU3VmZml4fWA7XG59XG52YXIgUmVxdWVzdCA9IGNsYXNzIF9SZXF1ZXN0IHtcbiAgI2JvZHk7XG4gICNpbm5lcjtcbiAgY29uc3RydWN0b3IodXJsLCBpbml0ID0ge30pIHtcbiAgICB0aGlzLiNib2R5ID0gY29lcmNlUmVxdWVzdEJvZHkoaW5pdC5ib2R5KTtcbiAgICB0aGlzLiNpbm5lciA9IHtcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKGluaXQuaGVhZGVycyksXG4gICAgICBtZXRob2Q6IGluaXQubWV0aG9kID8/IFwiR0VUXCIsXG4gICAgICB1cmk6IFwiXCIgKyB1cmwsXG4gICAgICB2ZXJzaW9uOiBpbml0LnZlcnNpb24gPz8geyB0YWc6IFwiSHR0cDExXCIgfVxuICAgIH07XG4gIH1cbiAgc3RhdGljIFttYWtlUmVxdWVzdF0oYm9keSwgaW5uZXIpIHtcbiAgICBjb25zdCBtZSA9IG5ldyBfUmVxdWVzdChpbm5lci51cmkpO1xuICAgIG1lLiNib2R5ID0gY29lcmNlUmVxdWVzdEJvZHkoYm9keSk7XG4gICAgbWUuI2lubmVyID0gaW5uZXI7XG4gICAgcmV0dXJuIG1lO1xuICB9XG4gIGdldCBoZWFkZXJzKCkge1xuICAgIHJldHVybiB0aGlzLiNpbm5lci5oZWFkZXJzO1xuICB9XG4gIGdldCBtZXRob2QoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2lubmVyLm1ldGhvZDtcbiAgfVxuICBnZXQgdXJpKCkge1xuICAgIHJldHVybiB0aGlzLiNpbm5lci51cmk7XG4gIH1cbiAgZ2V0IHVybCgpIHtcbiAgICByZXR1cm4gdGhpcy4jaW5uZXIudXJpO1xuICB9XG4gIGdldCB2ZXJzaW9uKCkge1xuICAgIHJldHVybiB0aGlzLiNpbm5lci52ZXJzaW9uO1xuICB9XG4gIGFycmF5QnVmZmVyKCkge1xuICAgIHJldHVybiB0aGlzLmJ5dGVzKCkuYnVmZmVyO1xuICB9XG4gIGJ5dGVzKCkge1xuICAgIHJldHVybiByZXF1ZXN0Qm9keVRvQnl0ZXModGhpcy4jYm9keSk7XG4gIH1cbiAganNvbigpIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZSh0aGlzLnRleHQoKSk7XG4gIH1cbiAgdGV4dCgpIHtcbiAgICByZXR1cm4gcmVxdWVzdEJvZHlUb1RleHQodGhpcy4jYm9keSk7XG4gIH1cbn07XG52YXIgZXhwb3J0ZWRIdHRwSGFuZGxlck9iamVjdHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFdlYWtTZXQoKTtcbnZhciBSb3V0ZXIgPSBjbGFzcyBfUm91dGVyIHtcbiAgI3JvdXRlcztcbiAgY29uc3RydWN0b3Iocm91dGVzID0gW10pIHtcbiAgICB0aGlzLiNyb3V0ZXMgPSByb3V0ZXM7XG4gIH1cbiAgZ2V0KHBhdGgsIGhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRSb3V0ZShcbiAgICAgIHsgdGFnOiBcIk1ldGhvZFwiLCB2YWx1ZTogeyB0YWc6IFwiR2V0XCIgfSB9LFxuICAgICAgcGF0aCxcbiAgICAgIGhhbmRsZXJcbiAgICApO1xuICB9XG4gIGhlYWQocGF0aCwgaGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLmFkZFJvdXRlKFxuICAgICAgeyB0YWc6IFwiTWV0aG9kXCIsIHZhbHVlOiB7IHRhZzogXCJIZWFkXCIgfSB9LFxuICAgICAgcGF0aCxcbiAgICAgIGhhbmRsZXJcbiAgICApO1xuICB9XG4gIG9wdGlvbnMocGF0aCwgaGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLmFkZFJvdXRlKFxuICAgICAgeyB0YWc6IFwiTWV0aG9kXCIsIHZhbHVlOiB7IHRhZzogXCJPcHRpb25zXCIgfSB9LFxuICAgICAgcGF0aCxcbiAgICAgIGhhbmRsZXJcbiAgICApO1xuICB9XG4gIHB1dChwYXRoLCBoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkUm91dGUoXG4gICAgICB7IHRhZzogXCJNZXRob2RcIiwgdmFsdWU6IHsgdGFnOiBcIlB1dFwiIH0gfSxcbiAgICAgIHBhdGgsXG4gICAgICBoYW5kbGVyXG4gICAgKTtcbiAgfVxuICBkZWxldGUocGF0aCwgaGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLmFkZFJvdXRlKFxuICAgICAgeyB0YWc6IFwiTWV0aG9kXCIsIHZhbHVlOiB7IHRhZzogXCJEZWxldGVcIiB9IH0sXG4gICAgICBwYXRoLFxuICAgICAgaGFuZGxlclxuICAgICk7XG4gIH1cbiAgcG9zdChwYXRoLCBoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkUm91dGUoXG4gICAgICB7IHRhZzogXCJNZXRob2RcIiwgdmFsdWU6IHsgdGFnOiBcIlBvc3RcIiB9IH0sXG4gICAgICBwYXRoLFxuICAgICAgaGFuZGxlclxuICAgICk7XG4gIH1cbiAgcGF0Y2gocGF0aCwgaGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLmFkZFJvdXRlKFxuICAgICAgeyB0YWc6IFwiTWV0aG9kXCIsIHZhbHVlOiB7IHRhZzogXCJQYXRjaFwiIH0gfSxcbiAgICAgIHBhdGgsXG4gICAgICBoYW5kbGVyXG4gICAgKTtcbiAgfVxuICBhbnkocGF0aCwgaGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLmFkZFJvdXRlKHsgdGFnOiBcIkFueVwiIH0sIHBhdGgsIGhhbmRsZXIpO1xuICB9XG4gIG5lc3QocGF0aCwgc3ViUm91dGVyKSB7XG4gICAgYXNzZXJ0VmFsaWRQYXRoKHBhdGgpO1xuICAgIGlmICh0aGlzLiNyb3V0ZXMuc29tZSgocm91dGUpID0+IHJvdXRlLnBhdGguc3RhcnRzV2l0aChwYXRoKSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgIGBDYW5ub3QgbmVzdCByb3V0ZXIgYXQgXFxgJHtwYXRofVxcYDsgZXhpc3Rpbmcgcm91dGVzIG92ZXJsYXAgd2l0aCBuZXN0ZWQgcGF0aGBcbiAgICAgICk7XG4gICAgfVxuICAgIGxldCBtZXJnZWQgPSBuZXcgX1JvdXRlcih0aGlzLiNyb3V0ZXMpO1xuICAgIGZvciAoY29uc3Qgcm91dGUgb2Ygc3ViUm91dGVyLiNyb3V0ZXMpIHtcbiAgICAgIG1lcmdlZCA9IG1lcmdlZC5hZGRSb3V0ZShcbiAgICAgICAgcm91dGUubWV0aG9kLFxuICAgICAgICBqb2luUGF0aHMocGF0aCwgcm91dGUucGF0aCksXG4gICAgICAgIHJvdXRlLmhhbmRsZXJcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBtZXJnZWQ7XG4gIH1cbiAgbWVyZ2Uob3RoZXJSb3V0ZXIpIHtcbiAgICBsZXQgbWVyZ2VkID0gbmV3IF9Sb3V0ZXIodGhpcy4jcm91dGVzKTtcbiAgICBmb3IgKGNvbnN0IHJvdXRlIG9mIG90aGVyUm91dGVyLiNyb3V0ZXMpIHtcbiAgICAgIG1lcmdlZCA9IG1lcmdlZC5hZGRSb3V0ZShyb3V0ZS5tZXRob2QsIHJvdXRlLnBhdGgsIHJvdXRlLmhhbmRsZXIpO1xuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VkO1xuICB9XG4gIGludG9Sb3V0ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuI3JvdXRlcy5zbGljZSgpO1xuICB9XG4gIGFkZFJvdXRlKG1ldGhvZCwgcGF0aCwgaGFuZGxlcikge1xuICAgIGFzc2VydFZhbGlkUGF0aChwYXRoKTtcbiAgICBjb25zdCBjYW5kaWRhdGUgPSB7IG1ldGhvZCwgcGF0aCwgaGFuZGxlciB9O1xuICAgIGlmICh0aGlzLiNyb3V0ZXMuc29tZSgocm91dGUpID0+IHJvdXRlc092ZXJsYXAocm91dGUsIGNhbmRpZGF0ZSkpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBSb3V0ZSBjb25mbGljdCBmb3IgXFxgJHtwYXRofVxcYGApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IF9Sb3V0ZXIoWy4uLnRoaXMuI3JvdXRlcywgY2FuZGlkYXRlXSk7XG4gIH1cbn07XG5mdW5jdGlvbiBtYWtlSHR0cEhhbmRsZXJFeHBvcnQoY3R4LCBvcHRzLCBmbikge1xuICBjb25zdCBoYW5kbGVyRXhwb3J0ID0gT2JqZWN0LmFzc2lnbihcbiAgICAoLi4uYXJncykgPT4gZm4oLi4uYXJncyksXG4gICAge1xuICAgICAgW2h0dHBIYW5kbGVyRm5dOiBmbixcbiAgICAgIFtleHBvcnRDb250ZXh0XTogY3R4LFxuICAgICAgW3JlZ2lzdGVyRXhwb3J0XShjdHgyLCBleHBvcnROYW1lKSB7XG4gICAgICAgIGlmIChleHBvcnRlZEh0dHBIYW5kbGVyT2JqZWN0cy5oYXMoaGFuZGxlckV4cG9ydCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICAgYEhUVFAgaGFuZGxlciAnJHtleHBvcnROYW1lfScgd2FzIGV4cG9ydGVkIG1vcmUgdGhhbiBvbmNlYFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgZXhwb3J0ZWRIdHRwSGFuZGxlck9iamVjdHMuYWRkKGhhbmRsZXJFeHBvcnQpO1xuICAgICAgICByZWdpc3Rlckh0dHBIYW5kbGVyKGN0eDIsIGV4cG9ydE5hbWUsIGZuLCBvcHRzKTtcbiAgICAgICAgY3R4Mi5odHRwSGFuZGxlckV4cG9ydHMuc2V0KFxuICAgICAgICAgIGhhbmRsZXJFeHBvcnQsXG4gICAgICAgICAgZXhwb3J0TmFtZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgKTtcbiAgcmV0dXJuIGhhbmRsZXJFeHBvcnQ7XG59XG5mdW5jdGlvbiBtYWtlSHR0cFJvdXRlckV4cG9ydChjdHgsIHJvdXRlcikge1xuICByZXR1cm4ge1xuICAgIFtleHBvcnRDb250ZXh0XTogY3R4LFxuICAgIFtyZWdpc3RlckV4cG9ydF0oY3R4Mikge1xuICAgICAgY3R4Mi5wZW5kaW5nSHR0cFJvdXRlcy5wdXNoKC4uLnJvdXRlci5pbnRvUm91dGVzKCkpO1xuICAgIH1cbiAgfTtcbn1cbmZ1bmN0aW9uIHJlZ2lzdGVySHR0cEhhbmRsZXIoY3R4LCBleHBvcnROYW1lLCBmbiwgb3B0cykge1xuICBjdHguZGVmaW5lSHR0cEhhbmRsZXIoZXhwb3J0TmFtZSk7XG4gIGN0eC5tb2R1bGVEZWYuaHR0cEhhbmRsZXJzLnB1c2goeyBzb3VyY2VOYW1lOiBleHBvcnROYW1lIH0pO1xuICBpZiAob3B0cz8ubmFtZSAhPSBudWxsKSB7XG4gICAgY3R4Lm1vZHVsZURlZi5leHBsaWNpdE5hbWVzLmVudHJpZXMucHVzaCh7XG4gICAgICB0YWc6IFwiRnVuY3Rpb25cIixcbiAgICAgIHZhbHVlOiB7XG4gICAgICAgIHNvdXJjZU5hbWU6IGV4cG9ydE5hbWUsXG4gICAgICAgIGNhbm9uaWNhbE5hbWU6IG9wdHMubmFtZVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGlmICghZm4ubmFtZSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShmbiwgXCJuYW1lXCIsIHsgdmFsdWU6IGV4cG9ydE5hbWUsIHdyaXRhYmxlOiBmYWxzZSB9KTtcbiAgfVxuICBjdHguaHR0cEhhbmRsZXJzLnB1c2goZm4pO1xufVxuXG4vLyBzcmMvc2VydmVyL2h0dHBfaW50ZXJuYWwudHNcbnZhciBpbXBvcnRfc3RhdHVzZXMgPSBfX3RvRVNNKHJlcXVpcmVfc3RhdHVzZXMoKSk7XG5cbi8vIHNyYy9zZXJ2ZXIvcmFuZ2UudHNcbnZhciBSYW5nZSA9IGNsYXNzIHtcbiAgI2Zyb207XG4gICN0bztcbiAgY29uc3RydWN0b3IoZnJvbSwgdG8pIHtcbiAgICB0aGlzLiNmcm9tID0gZnJvbSA/PyB7IHRhZzogXCJ1bmJvdW5kZWRcIiB9O1xuICAgIHRoaXMuI3RvID0gdG8gPz8geyB0YWc6IFwidW5ib3VuZGVkXCIgfTtcbiAgfVxuICBnZXQgZnJvbSgpIHtcbiAgICByZXR1cm4gdGhpcy4jZnJvbTtcbiAgfVxuICBnZXQgdG8oKSB7XG4gICAgcmV0dXJuIHRoaXMuI3RvO1xuICB9XG59O1xuXG4vLyBzcmMvbGliL3RhYmxlLnRzXG5mdW5jdGlvbiB0YWJsZShvcHRzLCByb3csIC4uLl8pIHtcbiAgY29uc3Qge1xuICAgIG5hbWUsXG4gICAgcHVibGljOiBpc1B1YmxpYyA9IGZhbHNlLFxuICAgIGluZGV4ZXM6IHVzZXJJbmRleGVzID0gW10sXG4gICAgc2NoZWR1bGVkLFxuICAgIGV2ZW50OiBpc0V2ZW50ID0gZmFsc2VcbiAgfSA9IG9wdHM7XG4gIGNvbnN0IGNvbElkcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIGNvbnN0IGNvbE5hbWVMaXN0ID0gW107XG4gIGlmICghKHJvdyBpbnN0YW5jZW9mIFJvd0J1aWxkZXIpKSB7XG4gICAgcm93ID0gbmV3IFJvd0J1aWxkZXIocm93KTtcbiAgfVxuICByb3cuYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50cy5mb3JFYWNoKChlbGVtLCBpKSA9PiB7XG4gICAgY29sSWRzLnNldChlbGVtLm5hbWUsIGkpO1xuICAgIGNvbE5hbWVMaXN0LnB1c2goZWxlbS5uYW1lKTtcbiAgfSk7XG4gIGNvbnN0IHBrID0gW107XG4gIGNvbnN0IGluZGV4ZXMgPSBbXTtcbiAgY29uc3QgY29uc3RyYWludHMgPSBbXTtcbiAgY29uc3Qgc2VxdWVuY2VzID0gW107XG4gIGxldCBzY2hlZHVsZUF0Q29sO1xuICBjb25zdCBkZWZhdWx0VmFsdWVzID0gW107XG4gIGZvciAoY29uc3QgW25hbWUyLCBidWlsZGVyXSBvZiBPYmplY3QuZW50cmllcyhyb3cucm93KSkge1xuICAgIGNvbnN0IG1ldGEgPSBidWlsZGVyLmNvbHVtbk1ldGFkYXRhO1xuICAgIGlmIChtZXRhLmlzUHJpbWFyeUtleSkge1xuICAgICAgcGsucHVzaChjb2xJZHMuZ2V0KG5hbWUyKSk7XG4gICAgfVxuICAgIGNvbnN0IGlzVW5pcXVlID0gbWV0YS5pc1VuaXF1ZSB8fCBtZXRhLmlzUHJpbWFyeUtleTtcbiAgICBpZiAobWV0YS5pbmRleFR5cGUgfHwgaXNVbmlxdWUpIHtcbiAgICAgIGNvbnN0IGFsZ28gPSBtZXRhLmluZGV4VHlwZSA/PyBcImJ0cmVlXCI7XG4gICAgICBjb25zdCBpZCA9IGNvbElkcy5nZXQobmFtZTIpO1xuICAgICAgbGV0IGFsZ29yaXRobTtcbiAgICAgIHN3aXRjaCAoYWxnbykge1xuICAgICAgICBjYXNlIFwiYnRyZWVcIjpcbiAgICAgICAgICBhbGdvcml0aG0gPSBSYXdJbmRleEFsZ29yaXRobS5CVHJlZShbaWRdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImhhc2hcIjpcbiAgICAgICAgICBhbGdvcml0aG0gPSBSYXdJbmRleEFsZ29yaXRobS5IYXNoKFtpZF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZGlyZWN0XCI6XG4gICAgICAgICAgYWxnb3JpdGhtID0gUmF3SW5kZXhBbGdvcml0aG0uRGlyZWN0KGlkKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGluZGV4ZXMucHVzaCh7XG4gICAgICAgIHNvdXJjZU5hbWU6IHZvaWQgMCxcbiAgICAgICAgLy8gVW5uYW1lZCBpbmRleGVzIHdpbGwgYmUgYXNzaWduZWQgYSBnbG9iYWxseSB1bmlxdWUgbmFtZVxuICAgICAgICBhY2Nlc3Nvck5hbWU6IG5hbWUyLFxuICAgICAgICBhbGdvcml0aG1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoaXNVbmlxdWUpIHtcbiAgICAgIGNvbnN0cmFpbnRzLnB1c2goe1xuICAgICAgICBzb3VyY2VOYW1lOiB2b2lkIDAsXG4gICAgICAgIGRhdGE6IHsgdGFnOiBcIlVuaXF1ZVwiLCB2YWx1ZTogeyBjb2x1bW5zOiBbY29sSWRzLmdldChuYW1lMildIH0gfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChtZXRhLmlzQXV0b0luY3JlbWVudCkge1xuICAgICAgc2VxdWVuY2VzLnB1c2goe1xuICAgICAgICBzb3VyY2VOYW1lOiB2b2lkIDAsXG4gICAgICAgIHN0YXJ0OiB2b2lkIDAsXG4gICAgICAgIG1pblZhbHVlOiB2b2lkIDAsXG4gICAgICAgIG1heFZhbHVlOiB2b2lkIDAsXG4gICAgICAgIGNvbHVtbjogY29sSWRzLmdldChuYW1lMiksXG4gICAgICAgIGluY3JlbWVudDogMW5cbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1ldGEsIFwiZGVmYXVsdFZhbHVlXCIpKSB7XG4gICAgICBjb25zdCB3cml0ZXIgPSBuZXcgQmluYXJ5V3JpdGVyKDE2KTtcbiAgICAgIGJ1aWxkZXIuc2VyaWFsaXplKHdyaXRlciwgbWV0YS5kZWZhdWx0VmFsdWUpO1xuICAgICAgZGVmYXVsdFZhbHVlcy5wdXNoKHtcbiAgICAgICAgY29sSWQ6IGNvbElkcy5nZXQobmFtZTIpLFxuICAgICAgICB2YWx1ZTogd3JpdGVyLmdldEJ1ZmZlcigpXG4gICAgICB9KTtcbiAgICB9XG4gICAgY29uc3QgYWxnZWJyYWljVHlwZSA9IGJ1aWxkZXIudHlwZUJ1aWxkZXIuYWxnZWJyYWljVHlwZTtcbiAgICBpZiAoc2NoZWR1bGVfYXRfZGVmYXVsdC5pc1NjaGVkdWxlQXQoYWxnZWJyYWljVHlwZSkpIHtcbiAgICAgIHNjaGVkdWxlQXRDb2wgPSBjb2xJZHMuZ2V0KG5hbWUyKTtcbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBpbmRleE9wdHMgb2YgdXNlckluZGV4ZXMgPz8gW10pIHtcbiAgICBjb25zdCBhY2Nlc3NvciA9IGluZGV4T3B0cy5hY2Nlc3NvcjtcbiAgICBpZiAodHlwZW9mIGFjY2Vzc29yICE9PSBcInN0cmluZ1wiIHx8IGFjY2Vzc29yLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgdGFibGVMYWJlbCA9IG5hbWUgPz8gXCI8dW5uYW1lZD5cIjtcbiAgICAgIGNvbnN0IGluZGV4TGFiZWwgPSBpbmRleE9wdHMubmFtZSA/PyBcIjx1bm5hbWVkPlwiO1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgYEluZGV4ICcke2luZGV4TGFiZWx9JyBvbiB0YWJsZSAnJHt0YWJsZUxhYmVsfScgbXVzdCBkZWZpbmUgYSBub24tZW1wdHkgJ2FjY2Vzc29yJ2BcbiAgICAgICk7XG4gICAgfVxuICAgIGxldCBhbGdvcml0aG07XG4gICAgc3dpdGNoIChpbmRleE9wdHMuYWxnb3JpdGhtKSB7XG4gICAgICBjYXNlIFwiYnRyZWVcIjpcbiAgICAgICAgYWxnb3JpdGhtID0ge1xuICAgICAgICAgIHRhZzogXCJCVHJlZVwiLFxuICAgICAgICAgIHZhbHVlOiBpbmRleE9wdHMuY29sdW1ucy5tYXAoKGMpID0+IGNvbElkcy5nZXQoYykpXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImhhc2hcIjpcbiAgICAgICAgYWxnb3JpdGhtID0ge1xuICAgICAgICAgIHRhZzogXCJIYXNoXCIsXG4gICAgICAgICAgdmFsdWU6IGluZGV4T3B0cy5jb2x1bW5zLm1hcCgoYykgPT4gY29sSWRzLmdldChjKSlcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiZGlyZWN0XCI6XG4gICAgICAgIGFsZ29yaXRobSA9IHsgdGFnOiBcIkRpcmVjdFwiLCB2YWx1ZTogY29sSWRzLmdldChpbmRleE9wdHMuY29sdW1uKSB9O1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaW5kZXhlcy5wdXNoKHtcbiAgICAgIHNvdXJjZU5hbWU6IHZvaWQgMCxcbiAgICAgIGFjY2Vzc29yTmFtZTogYWNjZXNzb3IsXG4gICAgICBhbGdvcml0aG0sXG4gICAgICBjYW5vbmljYWxOYW1lOiBpbmRleE9wdHMubmFtZVxuICAgIH0pO1xuICB9XG4gIGZvciAoY29uc3QgY29uc3RyYWludE9wdHMgb2Ygb3B0cy5jb25zdHJhaW50cyA/PyBbXSkge1xuICAgIGlmIChjb25zdHJhaW50T3B0cy5jb25zdHJhaW50ID09PSBcInVuaXF1ZVwiKSB7XG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICB0YWc6IFwiVW5pcXVlXCIsXG4gICAgICAgIHZhbHVlOiB7IGNvbHVtbnM6IGNvbnN0cmFpbnRPcHRzLmNvbHVtbnMubWFwKChjKSA9PiBjb2xJZHMuZ2V0KGMpKSB9XG4gICAgICB9O1xuICAgICAgY29uc3RyYWludHMucHVzaCh7IHNvdXJjZU5hbWU6IGNvbnN0cmFpbnRPcHRzLm5hbWUsIGRhdGEgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gIH1cbiAgY29uc3QgcHJvZHVjdFR5cGUgPSByb3cuYWxnZWJyYWljVHlwZS52YWx1ZTtcbiAgY29uc3Qgc2NoZWR1bGUgPSBzY2hlZHVsZWQgJiYgc2NoZWR1bGVBdENvbCAhPT0gdm9pZCAwID8geyBzY2hlZHVsZUF0Q29sLCByZWR1Y2VyOiBzY2hlZHVsZWQgfSA6IHZvaWQgMDtcbiAgcmV0dXJuIHtcbiAgICByb3dUeXBlOiByb3csXG4gICAgdGFibGVOYW1lOiBuYW1lLFxuICAgIHJvd1NwYWNldGltZVR5cGU6IHByb2R1Y3RUeXBlLFxuICAgIHRhYmxlRGVmOiAoY3R4LCBhY2NOYW1lKSA9PiB7XG4gICAgICBjb25zdCB0YWJsZU5hbWUgPSBuYW1lID8/IGFjY05hbWU7XG4gICAgICBpZiAocm93LnR5cGVOYW1lID09PSB2b2lkIDApIHtcbiAgICAgICAgcm93LnR5cGVOYW1lID0gdG9QYXNjYWxDYXNlKHRhYmxlTmFtZSk7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IGluZGV4IG9mIGluZGV4ZXMpIHtcbiAgICAgICAgY29uc3QgY29scyA9IGluZGV4LmFsZ29yaXRobS50YWcgPT09IFwiRGlyZWN0XCIgPyBbaW5kZXguYWxnb3JpdGhtLnZhbHVlXSA6IGluZGV4LmFsZ29yaXRobS52YWx1ZTtcbiAgICAgICAgY29uc3QgY29sUyA9IGNvbHMubWFwKChpKSA9PiBjb2xOYW1lTGlzdFtpXSkuam9pbihcIl9cIik7XG4gICAgICAgIGNvbnN0IHNvdXJjZU5hbWUgPSBpbmRleC5zb3VyY2VOYW1lID0gYCR7YWNjTmFtZX1fJHtjb2xTfV9pZHhfJHtpbmRleC5hbGdvcml0aG0udGFnLnRvTG93ZXJDYXNlKCl9YDtcbiAgICAgICAgY29uc3QgeyBjYW5vbmljYWxOYW1lIH0gPSBpbmRleDtcbiAgICAgICAgaWYgKGNhbm9uaWNhbE5hbWUgIT09IHZvaWQgMCkge1xuICAgICAgICAgIGN0eC5tb2R1bGVEZWYuZXhwbGljaXROYW1lcy5lbnRyaWVzLnB1c2goXG4gICAgICAgICAgICBFeHBsaWNpdE5hbWVFbnRyeS5JbmRleCh7IHNvdXJjZU5hbWUsIGNhbm9uaWNhbE5hbWUgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzb3VyY2VOYW1lOiBhY2NOYW1lLFxuICAgICAgICBwcm9kdWN0VHlwZVJlZjogY3R4LnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseShyb3cpLnJlZixcbiAgICAgICAgcHJpbWFyeUtleTogcGssXG4gICAgICAgIGluZGV4ZXMsXG4gICAgICAgIGNvbnN0cmFpbnRzLFxuICAgICAgICBzZXF1ZW5jZXMsXG4gICAgICAgIHRhYmxlVHlwZTogeyB0YWc6IFwiVXNlclwiIH0sXG4gICAgICAgIHRhYmxlQWNjZXNzOiB7IHRhZzogaXNQdWJsaWMgPyBcIlB1YmxpY1wiIDogXCJQcml2YXRlXCIgfSxcbiAgICAgICAgZGVmYXVsdFZhbHVlcyxcbiAgICAgICAgaXNFdmVudFxuICAgICAgfTtcbiAgICB9LFxuICAgIC8vIFByZXNlcnZlIHRoZSBkZWNsYXJlZCBpbmRleCBvcHRpb25zIGFzIHJ1bnRpbWUgZGF0YSBzbyBgdGFibGVUb1NjaGVtYWBcbiAgICAvLyBjYW4gZXhwb3NlIHRoZW0gd2l0aG91dCB0eXBlLXNtdWdnbGluZy5cbiAgICBpZHhzOiB1c2VySW5kZXhlcyxcbiAgICBjb25zdHJhaW50cyxcbiAgICBzY2hlZHVsZUF0Q29sLFxuICAgIHNjaGVkdWxlXG4gIH07XG59XG5cbi8vIHNyYy9saWIvcXVlcnkudHNcbnZhciBRdWVyeUJyYW5kID0gU3ltYm9sKFwiUXVlcnlCcmFuZFwiKTtcbnZhciBpc1Jvd1R5cGVkUXVlcnkgPSAodmFsKSA9PiAhIXZhbCAmJiB0eXBlb2YgdmFsID09PSBcIm9iamVjdFwiICYmIFF1ZXJ5QnJhbmQgaW4gdmFsO1xudmFyIGlzVHlwZWRRdWVyeSA9ICh2YWwpID0+ICEhdmFsICYmIHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCIgJiYgUXVlcnlCcmFuZCBpbiB2YWw7XG5mdW5jdGlvbiB0b1NxbChxKSB7XG4gIHJldHVybiBxLnRvU3FsKCk7XG59XG52YXIgU2VtaWpvaW5JbXBsID0gY2xhc3MgX1NlbWlqb2luSW1wbCB7XG4gIGNvbnN0cnVjdG9yKHNvdXJjZVF1ZXJ5LCBmaWx0ZXJRdWVyeSwgam9pbkNvbmRpdGlvbikge1xuICAgIHRoaXMuc291cmNlUXVlcnkgPSBzb3VyY2VRdWVyeTtcbiAgICB0aGlzLmZpbHRlclF1ZXJ5ID0gZmlsdGVyUXVlcnk7XG4gICAgdGhpcy5qb2luQ29uZGl0aW9uID0gam9pbkNvbmRpdGlvbjtcbiAgICBpZiAoc291cmNlUXVlcnkudGFibGUuc291cmNlTmFtZSA9PT0gZmlsdGVyUXVlcnkudGFibGUuc291cmNlTmFtZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHNlbWlqb2luIGEgdGFibGUgdG8gaXRzZWxmXCIpO1xuICAgIH1cbiAgfVxuICBbUXVlcnlCcmFuZF0gPSB0cnVlO1xuICB0eXBlID0gXCJzZW1pam9pblwiO1xuICBidWlsZCgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB3aGVyZShwcmVkaWNhdGUpIHtcbiAgICBjb25zdCBuZXh0U291cmNlUXVlcnkgPSB0aGlzLnNvdXJjZVF1ZXJ5LndoZXJlKHByZWRpY2F0ZSk7XG4gICAgcmV0dXJuIG5ldyBfU2VtaWpvaW5JbXBsKFxuICAgICAgbmV4dFNvdXJjZVF1ZXJ5LFxuICAgICAgdGhpcy5maWx0ZXJRdWVyeSxcbiAgICAgIHRoaXMuam9pbkNvbmRpdGlvblxuICAgICk7XG4gIH1cbiAgdG9TcWwoKSB7XG4gICAgY29uc3QgbGVmdCA9IHRoaXMuZmlsdGVyUXVlcnk7XG4gICAgY29uc3QgcmlnaHQgPSB0aGlzLnNvdXJjZVF1ZXJ5O1xuICAgIGNvbnN0IGxlZnRUYWJsZSA9IHF1b3RlSWRlbnRpZmllcihsZWZ0LnRhYmxlLnNvdXJjZU5hbWUpO1xuICAgIGNvbnN0IHJpZ2h0VGFibGUgPSBxdW90ZUlkZW50aWZpZXIocmlnaHQudGFibGUuc291cmNlTmFtZSk7XG4gICAgbGV0IHNxbCA9IGBTRUxFQ1QgJHtyaWdodFRhYmxlfS4qIEZST00gJHtsZWZ0VGFibGV9IEpPSU4gJHtyaWdodFRhYmxlfSBPTiAke2Jvb2xlYW5FeHByVG9TcWwodGhpcy5qb2luQ29uZGl0aW9uKX1gO1xuICAgIGNvbnN0IGNsYXVzZXMgPSBbXTtcbiAgICBpZiAobGVmdC53aGVyZUNsYXVzZSkge1xuICAgICAgY2xhdXNlcy5wdXNoKGJvb2xlYW5FeHByVG9TcWwobGVmdC53aGVyZUNsYXVzZSkpO1xuICAgIH1cbiAgICBpZiAocmlnaHQud2hlcmVDbGF1c2UpIHtcbiAgICAgIGNsYXVzZXMucHVzaChib29sZWFuRXhwclRvU3FsKHJpZ2h0LndoZXJlQ2xhdXNlKSk7XG4gICAgfVxuICAgIGlmIChjbGF1c2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHdoZXJlU3FsID0gY2xhdXNlcy5sZW5ndGggPT09IDEgPyBjbGF1c2VzWzBdIDogY2xhdXNlcy5tYXAod3JhcEluUGFyZW5zKS5qb2luKFwiIEFORCBcIik7XG4gICAgICBzcWwgKz0gYCBXSEVSRSAke3doZXJlU3FsfWA7XG4gICAgfVxuICAgIHJldHVybiBzcWw7XG4gIH1cbn07XG52YXIgRnJvbUJ1aWxkZXIgPSBjbGFzcyBfRnJvbUJ1aWxkZXIge1xuICBjb25zdHJ1Y3Rvcih0YWJsZTIsIHdoZXJlQ2xhdXNlKSB7XG4gICAgdGhpcy50YWJsZSA9IHRhYmxlMjtcbiAgICB0aGlzLndoZXJlQ2xhdXNlID0gd2hlcmVDbGF1c2U7XG4gIH1cbiAgW1F1ZXJ5QnJhbmRdID0gdHJ1ZTtcbiAgd2hlcmUocHJlZGljYXRlKSB7XG4gICAgY29uc3QgbmV3Q29uZGl0aW9uID0gbm9ybWFsaXplUHJlZGljYXRlRXhwcihwcmVkaWNhdGUodGhpcy50YWJsZS5jb2xzKSk7XG4gICAgY29uc3QgbmV4dFdoZXJlID0gdGhpcy53aGVyZUNsYXVzZSA/IHRoaXMud2hlcmVDbGF1c2UuYW5kKG5ld0NvbmRpdGlvbikgOiBuZXdDb25kaXRpb247XG4gICAgcmV0dXJuIG5ldyBfRnJvbUJ1aWxkZXIodGhpcy50YWJsZSwgbmV4dFdoZXJlKTtcbiAgfVxuICByaWdodFNlbWlqb2luKHJpZ2h0LCBvbikge1xuICAgIGNvbnN0IHNvdXJjZVF1ZXJ5ID0gbmV3IF9Gcm9tQnVpbGRlcihyaWdodCk7XG4gICAgY29uc3Qgam9pbkNvbmRpdGlvbiA9IG9uKFxuICAgICAgdGhpcy50YWJsZS5pbmRleGVkQ29scyxcbiAgICAgIHJpZ2h0LmluZGV4ZWRDb2xzXG4gICAgKTtcbiAgICByZXR1cm4gbmV3IFNlbWlqb2luSW1wbChzb3VyY2VRdWVyeSwgdGhpcywgam9pbkNvbmRpdGlvbik7XG4gIH1cbiAgbGVmdFNlbWlqb2luKHJpZ2h0LCBvbikge1xuICAgIGNvbnN0IGZpbHRlclF1ZXJ5ID0gbmV3IF9Gcm9tQnVpbGRlcihyaWdodCk7XG4gICAgY29uc3Qgam9pbkNvbmRpdGlvbiA9IG9uKFxuICAgICAgdGhpcy50YWJsZS5pbmRleGVkQ29scyxcbiAgICAgIHJpZ2h0LmluZGV4ZWRDb2xzXG4gICAgKTtcbiAgICByZXR1cm4gbmV3IFNlbWlqb2luSW1wbCh0aGlzLCBmaWx0ZXJRdWVyeSwgam9pbkNvbmRpdGlvbik7XG4gIH1cbiAgdG9TcWwoKSB7XG4gICAgcmV0dXJuIHJlbmRlclNlbGVjdFNxbFdpdGhKb2lucyh0aGlzLnRhYmxlLCB0aGlzLndoZXJlQ2xhdXNlKTtcbiAgfVxuICBidWlsZCgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufTtcbnZhciBUYWJsZVJlZkltcGwgPSBjbGFzcyB7XG4gIFtRdWVyeUJyYW5kXSA9IHRydWU7XG4gIHR5cGUgPSBcInRhYmxlXCI7XG4gIHNvdXJjZU5hbWU7XG4gIGFjY2Vzc29yTmFtZTtcbiAgY29scztcbiAgaW5kZXhlZENvbHM7XG4gIHRhYmxlRGVmO1xuICAvLyBEZWxlZ2F0ZSBVbnR5cGVkVGFibGVEZWYgcHJvcGVydGllcyBmcm9tIHRhYmxlRGVmIHNvIHRoaXMgY2FuIGJlIHVzZWQgYXMgYSB0YWJsZSBkZWYuXG4gIGdldCBjb2x1bW5zKCkge1xuICAgIHJldHVybiB0aGlzLnRhYmxlRGVmLmNvbHVtbnM7XG4gIH1cbiAgZ2V0IGluZGV4ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMudGFibGVEZWYuaW5kZXhlcztcbiAgfVxuICBnZXQgcm93VHlwZSgpIHtcbiAgICByZXR1cm4gdGhpcy50YWJsZURlZi5yb3dUeXBlO1xuICB9XG4gIGdldCBjb25zdHJhaW50cygpIHtcbiAgICByZXR1cm4gdGhpcy50YWJsZURlZi5jb25zdHJhaW50cztcbiAgfVxuICBjb25zdHJ1Y3Rvcih0YWJsZURlZikge1xuICAgIHRoaXMuc291cmNlTmFtZSA9IHRhYmxlRGVmLnNvdXJjZU5hbWU7XG4gICAgdGhpcy5hY2Nlc3Nvck5hbWUgPSB0YWJsZURlZi5hY2Nlc3Nvck5hbWU7XG4gICAgdGhpcy5jb2xzID0gY3JlYXRlUm93RXhwcih0YWJsZURlZik7XG4gICAgdGhpcy5pbmRleGVkQ29scyA9IHRoaXMuY29scztcbiAgICB0aGlzLnRhYmxlRGVmID0gdGFibGVEZWY7XG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgfVxuICBhc0Zyb20oKSB7XG4gICAgcmV0dXJuIG5ldyBGcm9tQnVpbGRlcih0aGlzKTtcbiAgfVxuICByaWdodFNlbWlqb2luKG90aGVyLCBvbikge1xuICAgIHJldHVybiB0aGlzLmFzRnJvbSgpLnJpZ2h0U2VtaWpvaW4ob3RoZXIsIG9uKTtcbiAgfVxuICBsZWZ0U2VtaWpvaW4ob3RoZXIsIG9uKSB7XG4gICAgcmV0dXJuIHRoaXMuYXNGcm9tKCkubGVmdFNlbWlqb2luKG90aGVyLCBvbik7XG4gIH1cbiAgYnVpbGQoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXNGcm9tKCkuYnVpbGQoKTtcbiAgfVxuICB0b1NxbCgpIHtcbiAgICByZXR1cm4gdGhpcy5hc0Zyb20oKS50b1NxbCgpO1xuICB9XG4gIHdoZXJlKHByZWRpY2F0ZSkge1xuICAgIHJldHVybiB0aGlzLmFzRnJvbSgpLndoZXJlKHByZWRpY2F0ZSk7XG4gIH1cbn07XG5mdW5jdGlvbiBjcmVhdGVUYWJsZVJlZkZyb21EZWYodGFibGVEZWYpIHtcbiAgcmV0dXJuIG5ldyBUYWJsZVJlZkltcGwodGFibGVEZWYpO1xufVxuZnVuY3Rpb24gbWFrZVF1ZXJ5QnVpbGRlcihzY2hlbWEyKSB7XG4gIGNvbnN0IHFiID0gLyogQF9fUFVSRV9fICovIE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGZvciAoY29uc3QgdGFibGUyIG9mIE9iamVjdC52YWx1ZXMoc2NoZW1hMi50YWJsZXMpKSB7XG4gICAgY29uc3QgcmVmID0gY3JlYXRlVGFibGVSZWZGcm9tRGVmKFxuICAgICAgdGFibGUyXG4gICAgKTtcbiAgICBxYlt0YWJsZTIuYWNjZXNzb3JOYW1lXSA9IHJlZjtcbiAgfVxuICByZXR1cm4gT2JqZWN0LmZyZWV6ZShxYik7XG59XG5mdW5jdGlvbiBtYWtlRnJvbUJ1aWxkZXIodGFibGVzKSB7XG4gIGNvbnN0IHJlc3VsdCA9IC8qIEBfX1BVUkVfXyAqLyBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBjb25zdCBuYW1lc3BhY2VzID0gLyogQF9fUFVSRV9fICovIE9iamVjdC5jcmVhdGUoXG4gICAgbnVsbFxuICApO1xuICBmb3IgKGNvbnN0IHRhYmxlMiBvZiBPYmplY3QudmFsdWVzKHRhYmxlcykpIHtcbiAgICBjb25zdCBkb3RJZHggPSB0YWJsZTIuc291cmNlTmFtZS5pbmRleE9mKFwiLlwiKTtcbiAgICBpZiAoZG90SWR4ID09PSAtMSkge1xuICAgICAgcmVzdWx0W3RhYmxlMi5hY2Nlc3Nvck5hbWVdID0gY3JlYXRlVGFibGVSZWZGcm9tRGVmKHRhYmxlMik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG5zID0gdGFibGUyLnNvdXJjZU5hbWUuc2xpY2UoMCwgZG90SWR4KTtcbiAgICAgIGNvbnN0IGtleSA9IHRhYmxlMi5zb3VyY2VOYW1lLnNsaWNlKGRvdElkeCArIDEpO1xuICAgICAgKG5hbWVzcGFjZXNbbnNdID8/PSAvKiBAX19QVVJFX18gKi8gT2JqZWN0LmNyZWF0ZShudWxsKSlba2V5XSA9IGNyZWF0ZVRhYmxlUmVmRnJvbURlZihcbiAgICAgICAgdGFibGUyXG4gICAgICApO1xuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IFtucywgbnNUYWJsZXNdIG9mIE9iamVjdC5lbnRyaWVzKG5hbWVzcGFjZXMpKSB7XG4gICAgcmVzdWx0W25zXSA9IE9iamVjdC5mcmVlemUobnNUYWJsZXMpO1xuICB9XG4gIHJldHVybiBPYmplY3QuZnJlZXplKHJlc3VsdCk7XG59XG5mdW5jdGlvbiBjcmVhdGVSb3dFeHByKHRhYmxlRGVmKSB7XG4gIGNvbnN0IHJvdyA9IHt9O1xuICBmb3IgKGNvbnN0IGNvbHVtbk5hbWUgb2YgT2JqZWN0LmtleXModGFibGVEZWYuY29sdW1ucykpIHtcbiAgICBjb25zdCBjb2x1bW5CdWlsZGVyID0gdGFibGVEZWYuY29sdW1uc1tjb2x1bW5OYW1lXTtcbiAgICBjb25zdCBjb2x1bW4gPSBuZXcgQ29sdW1uRXhwcmVzc2lvbihcbiAgICAgIHRhYmxlRGVmLnNvdXJjZU5hbWUsXG4gICAgICBjb2x1bW5OYW1lLFxuICAgICAgY29sdW1uQnVpbGRlci50eXBlQnVpbGRlci5hbGdlYnJhaWNUeXBlLFxuICAgICAgY29sdW1uQnVpbGRlci5jb2x1bW5NZXRhZGF0YS5uYW1lXG4gICAgKTtcbiAgICByb3dbY29sdW1uTmFtZV0gPSBPYmplY3QuZnJlZXplKGNvbHVtbik7XG4gIH1cbiAgcmV0dXJuIE9iamVjdC5mcmVlemUocm93KTtcbn1cbmZ1bmN0aW9uIHJlbmRlclNlbGVjdFNxbFdpdGhKb2lucyh0YWJsZTIsIHdoZXJlLCBleHRyYUNsYXVzZXMgPSBbXSkge1xuICBjb25zdCBxdW90ZWRUYWJsZSA9IHF1b3RlSWRlbnRpZmllcih0YWJsZTIuc291cmNlTmFtZSk7XG4gIGNvbnN0IHNxbCA9IGBTRUxFQ1QgKiBGUk9NICR7cXVvdGVkVGFibGV9YDtcbiAgY29uc3QgY2xhdXNlcyA9IFtdO1xuICBpZiAod2hlcmUpIGNsYXVzZXMucHVzaChib29sZWFuRXhwclRvU3FsKHdoZXJlKSk7XG4gIGNsYXVzZXMucHVzaCguLi5leHRyYUNsYXVzZXMpO1xuICBpZiAoY2xhdXNlcy5sZW5ndGggPT09IDApIHJldHVybiBzcWw7XG4gIGNvbnN0IHdoZXJlU3FsID0gY2xhdXNlcy5sZW5ndGggPT09IDEgPyBjbGF1c2VzWzBdIDogY2xhdXNlcy5tYXAod3JhcEluUGFyZW5zKS5qb2luKFwiIEFORCBcIik7XG4gIHJldHVybiBgJHtzcWx9IFdIRVJFICR7d2hlcmVTcWx9YDtcbn1cbnZhciBDb2x1bW5FeHByZXNzaW9uID0gY2xhc3Mge1xuICB0eXBlID0gXCJjb2x1bW5cIjtcbiAgLy8gVGhpcyBpcyB0aGUgY29sdW1uIGFjY2Vzc29yXG4gIGNvbHVtbjtcbiAgLy8gVGhlIG5hbWUgb2YgdGhlIGNvbHVtbiBpbiB0aGUgZGF0YWJhc2UuXG4gIGNvbHVtbk5hbWU7XG4gIHRhYmxlO1xuICAvLyBwaGFudG9tOiBhY3R1YWwgcnVudGltZSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAgdHNWYWx1ZVR5cGU7XG4gIHNwYWNldGltZVR5cGU7XG4gIGNvbnN0cnVjdG9yKHRhYmxlMiwgY29sdW1uLCBzcGFjZXRpbWVUeXBlLCBjb2x1bW5OYW1lKSB7XG4gICAgdGhpcy50YWJsZSA9IHRhYmxlMjtcbiAgICB0aGlzLmNvbHVtbiA9IGNvbHVtbjtcbiAgICB0aGlzLmNvbHVtbk5hbWUgPSBjb2x1bW5OYW1lIHx8IGNvbHVtbjtcbiAgICB0aGlzLnNwYWNldGltZVR5cGUgPSBzcGFjZXRpbWVUeXBlO1xuICB9XG4gIGVxKHgpIHtcbiAgICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHtcbiAgICAgIHR5cGU6IFwiZXFcIixcbiAgICAgIGxlZnQ6IHRoaXMsXG4gICAgICByaWdodDogbm9ybWFsaXplVmFsdWUoeClcbiAgICB9KTtcbiAgfVxuICBuZSh4KSB7XG4gICAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XG4gICAgICB0eXBlOiBcIm5lXCIsXG4gICAgICBsZWZ0OiB0aGlzLFxuICAgICAgcmlnaHQ6IG5vcm1hbGl6ZVZhbHVlKHgpXG4gICAgfSk7XG4gIH1cbiAgbHQoeCkge1xuICAgIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoe1xuICAgICAgdHlwZTogXCJsdFwiLFxuICAgICAgbGVmdDogdGhpcyxcbiAgICAgIHJpZ2h0OiBub3JtYWxpemVWYWx1ZSh4KVxuICAgIH0pO1xuICB9XG4gIGx0ZSh4KSB7XG4gICAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XG4gICAgICB0eXBlOiBcImx0ZVwiLFxuICAgICAgbGVmdDogdGhpcyxcbiAgICAgIHJpZ2h0OiBub3JtYWxpemVWYWx1ZSh4KVxuICAgIH0pO1xuICB9XG4gIGd0KHgpIHtcbiAgICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHtcbiAgICAgIHR5cGU6IFwiZ3RcIixcbiAgICAgIGxlZnQ6IHRoaXMsXG4gICAgICByaWdodDogbm9ybWFsaXplVmFsdWUoeClcbiAgICB9KTtcbiAgfVxuICBndGUoeCkge1xuICAgIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoe1xuICAgICAgdHlwZTogXCJndGVcIixcbiAgICAgIGxlZnQ6IHRoaXMsXG4gICAgICByaWdodDogbm9ybWFsaXplVmFsdWUoeClcbiAgICB9KTtcbiAgfVxufTtcbmZ1bmN0aW9uIGxpdGVyYWwodmFsdWUpIHtcbiAgcmV0dXJuIHsgdHlwZTogXCJsaXRlcmFsXCIsIHZhbHVlIH07XG59XG5mdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWwpIHtcbiAgaWYgKHZhbC50eXBlID09PSBcImxpdGVyYWxcIilcbiAgICByZXR1cm4gdmFsO1xuICBpZiAodHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIiAmJiB2YWwgIT0gbnVsbCAmJiBcInR5cGVcIiBpbiB2YWwgJiYgdmFsLnR5cGUgPT09IFwiY29sdW1uXCIpIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG4gIHJldHVybiBsaXRlcmFsKHZhbCk7XG59XG5mdW5jdGlvbiBub3JtYWxpemVQcmVkaWNhdGVFeHByKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEJvb2xlYW5FeHByKSByZXR1cm4gdmFsdWU7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiYm9vbGVhblwiKSB7XG4gICAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XG4gICAgICB0eXBlOiBcImVxXCIsXG4gICAgICBsZWZ0OiBsaXRlcmFsKHZhbHVlKSxcbiAgICAgIHJpZ2h0OiBsaXRlcmFsKHRydWUpXG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XG4gICAgdHlwZTogXCJlcVwiLFxuICAgIGxlZnQ6IHZhbHVlLFxuICAgIHJpZ2h0OiBsaXRlcmFsKHRydWUpXG4gIH0pO1xufVxudmFyIEJvb2xlYW5FeHByID0gY2xhc3MgX0Jvb2xlYW5FeHByIHtcbiAgY29uc3RydWN0b3IoZGF0YSkge1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gIH1cbiAgYW5kKG90aGVyKSB7XG4gICAgcmV0dXJuIG5ldyBfQm9vbGVhbkV4cHIoe1xuICAgICAgdHlwZTogXCJhbmRcIixcbiAgICAgIGNsYXVzZXM6IFt0aGlzLmRhdGEsIG90aGVyLmRhdGFdXG4gICAgfSk7XG4gIH1cbiAgb3Iob3RoZXIpIHtcbiAgICByZXR1cm4gbmV3IF9Cb29sZWFuRXhwcih7XG4gICAgICB0eXBlOiBcIm9yXCIsXG4gICAgICBjbGF1c2VzOiBbdGhpcy5kYXRhLCBvdGhlci5kYXRhXVxuICAgIH0pO1xuICB9XG4gIG5vdCgpIHtcbiAgICByZXR1cm4gbmV3IF9Cb29sZWFuRXhwcih7IHR5cGU6IFwibm90XCIsIGNsYXVzZTogdGhpcy5kYXRhIH0pO1xuICB9XG59O1xuZnVuY3Rpb24gbm90KGNsYXVzZSkge1xuICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHsgdHlwZTogXCJub3RcIiwgY2xhdXNlOiBjbGF1c2UuZGF0YSB9KTtcbn1cbmZ1bmN0aW9uIGFuZChmaXJzdCwgc2Vjb25kLCAuLi5yZXN0KSB7XG4gIGNvbnN0IGNsYXVzZXMgPSBbZmlyc3QsIHNlY29uZCwgLi4ucmVzdF07XG4gIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoe1xuICAgIHR5cGU6IFwiYW5kXCIsXG4gICAgY2xhdXNlczogY2xhdXNlcy5tYXAoKGMpID0+IGMuZGF0YSlcbiAgfSk7XG59XG5mdW5jdGlvbiBvcihmaXJzdCwgc2Vjb25kLCAuLi5yZXN0KSB7XG4gIGNvbnN0IGNsYXVzZXMgPSBbZmlyc3QsIHNlY29uZCwgLi4ucmVzdF07XG4gIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoe1xuICAgIHR5cGU6IFwib3JcIixcbiAgICBjbGF1c2VzOiBjbGF1c2VzLm1hcCgoYykgPT4gYy5kYXRhKVxuICB9KTtcbn1cbmZ1bmN0aW9uIGJvb2xlYW5FeHByVG9TcWwoZXhwciwgdGFibGVBbGlhcykge1xuICBjb25zdCBkYXRhID0gZXhwciBpbnN0YW5jZW9mIEJvb2xlYW5FeHByID8gZXhwci5kYXRhIDogZXhwcjtcbiAgc3dpdGNoIChkYXRhLnR5cGUpIHtcbiAgICBjYXNlIFwiZXFcIjpcbiAgICAgIHJldHVybiBgJHt2YWx1ZUV4cHJUb1NxbChkYXRhLmxlZnQpfSA9ICR7dmFsdWVFeHByVG9TcWwoZGF0YS5yaWdodCl9YDtcbiAgICBjYXNlIFwibmVcIjpcbiAgICAgIHJldHVybiBgJHt2YWx1ZUV4cHJUb1NxbChkYXRhLmxlZnQpfSA8PiAke3ZhbHVlRXhwclRvU3FsKGRhdGEucmlnaHQpfWA7XG4gICAgY2FzZSBcImd0XCI6XG4gICAgICByZXR1cm4gYCR7dmFsdWVFeHByVG9TcWwoZGF0YS5sZWZ0KX0gPiAke3ZhbHVlRXhwclRvU3FsKGRhdGEucmlnaHQpfWA7XG4gICAgY2FzZSBcImd0ZVwiOlxuICAgICAgcmV0dXJuIGAke3ZhbHVlRXhwclRvU3FsKGRhdGEubGVmdCl9ID49ICR7dmFsdWVFeHByVG9TcWwoZGF0YS5yaWdodCl9YDtcbiAgICBjYXNlIFwibHRcIjpcbiAgICAgIHJldHVybiBgJHt2YWx1ZUV4cHJUb1NxbChkYXRhLmxlZnQpfSA8ICR7dmFsdWVFeHByVG9TcWwoZGF0YS5yaWdodCl9YDtcbiAgICBjYXNlIFwibHRlXCI6XG4gICAgICByZXR1cm4gYCR7dmFsdWVFeHByVG9TcWwoZGF0YS5sZWZ0KX0gPD0gJHt2YWx1ZUV4cHJUb1NxbChkYXRhLnJpZ2h0KX1gO1xuICAgIGNhc2UgXCJhbmRcIjpcbiAgICAgIHJldHVybiBkYXRhLmNsYXVzZXMubWFwKChjKSA9PiBib29sZWFuRXhwclRvU3FsKGMpKS5tYXAod3JhcEluUGFyZW5zKS5qb2luKFwiIEFORCBcIik7XG4gICAgY2FzZSBcIm9yXCI6XG4gICAgICByZXR1cm4gZGF0YS5jbGF1c2VzLm1hcCgoYykgPT4gYm9vbGVhbkV4cHJUb1NxbChjKSkubWFwKHdyYXBJblBhcmVucykuam9pbihcIiBPUiBcIik7XG4gICAgY2FzZSBcIm5vdFwiOlxuICAgICAgcmV0dXJuIGBOT1QgJHt3cmFwSW5QYXJlbnMoYm9vbGVhbkV4cHJUb1NxbChkYXRhLmNsYXVzZSkpfWA7XG4gIH1cbn1cbmZ1bmN0aW9uIHdyYXBJblBhcmVucyhzcWwpIHtcbiAgcmV0dXJuIGAoJHtzcWx9KWA7XG59XG5mdW5jdGlvbiB2YWx1ZUV4cHJUb1NxbChleHByLCB0YWJsZUFsaWFzKSB7XG4gIGlmIChpc0xpdGVyYWxFeHByKGV4cHIpKSB7XG4gICAgcmV0dXJuIGxpdGVyYWxWYWx1ZVRvU3FsKGV4cHIudmFsdWUpO1xuICB9XG4gIGNvbnN0IHRhYmxlMiA9IGV4cHIudGFibGU7XG4gIHJldHVybiBgJHtxdW90ZUlkZW50aWZpZXIodGFibGUyKX0uJHtxdW90ZUlkZW50aWZpZXIoZXhwci5jb2x1bW5OYW1lKX1gO1xufVxuZnVuY3Rpb24gbGl0ZXJhbFZhbHVlVG9TcWwodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB2b2lkIDApIHtcbiAgICByZXR1cm4gXCJOVUxMXCI7XG4gIH1cbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSWRlbnRpdHkgfHwgdmFsdWUgaW5zdGFuY2VvZiBDb25uZWN0aW9uSWQgfHwgdmFsdWUgaW5zdGFuY2VvZiBVdWlkKSB7XG4gICAgcmV0dXJuIGAweCR7dmFsdWUudG9IZXhTdHJpbmcoKX1gO1xuICB9XG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFRpbWVzdGFtcCkge1xuICAgIHJldHVybiBgJyR7dmFsdWUudG9JU09TdHJpbmcoKX0nYDtcbiAgfVxuICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICBjYXNlIFwiYmlnaW50XCI6XG4gICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbiAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgICAgcmV0dXJuIHZhbHVlID8gXCJUUlVFXCIgOiBcIkZBTFNFXCI7XG4gICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgcmV0dXJuIGAnJHt2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIil9J2A7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBgJyR7SlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYDtcbiAgfVxufVxuZnVuY3Rpb24gcXVvdGVJZGVudGlmaWVyKG5hbWUpIHtcbiAgcmV0dXJuIG5hbWUuc3BsaXQoXCIuXCIpLm1hcCgocGFydCkgPT4gYFwiJHtwYXJ0LnJlcGxhY2UoL1wiL2csICdcIlwiJyl9XCJgKS5qb2luKFwiLlwiKTtcbn1cbmZ1bmN0aW9uIGlzTGl0ZXJhbEV4cHIoZXhwcikge1xuICByZXR1cm4gZXhwci50eXBlID09PSBcImxpdGVyYWxcIjtcbn1cbmZ1bmN0aW9uIGV2YWx1YXRlQm9vbGVhbkV4cHIoZXhwciwgcm93KSB7XG4gIHJldHVybiBldmFsdWF0ZURhdGEoZXhwci5kYXRhLCByb3cpO1xufVxuZnVuY3Rpb24gZXZhbHVhdGVEYXRhKGRhdGEsIHJvdykge1xuICBzd2l0Y2ggKGRhdGEudHlwZSkge1xuICAgIGNhc2UgXCJlcVwiOlxuICAgICAgcmV0dXJuIHJlc29sdmVWYWx1ZShkYXRhLmxlZnQsIHJvdykgPT09IHJlc29sdmVWYWx1ZShkYXRhLnJpZ2h0LCByb3cpO1xuICAgIGNhc2UgXCJuZVwiOlxuICAgICAgcmV0dXJuIHJlc29sdmVWYWx1ZShkYXRhLmxlZnQsIHJvdykgIT09IHJlc29sdmVWYWx1ZShkYXRhLnJpZ2h0LCByb3cpO1xuICAgIGNhc2UgXCJndFwiOlxuICAgICAgcmV0dXJuIHJlc29sdmVWYWx1ZShkYXRhLmxlZnQsIHJvdykgPiByZXNvbHZlVmFsdWUoZGF0YS5yaWdodCwgcm93KTtcbiAgICBjYXNlIFwiZ3RlXCI6XG4gICAgICByZXR1cm4gcmVzb2x2ZVZhbHVlKGRhdGEubGVmdCwgcm93KSA+PSByZXNvbHZlVmFsdWUoZGF0YS5yaWdodCwgcm93KTtcbiAgICBjYXNlIFwibHRcIjpcbiAgICAgIHJldHVybiByZXNvbHZlVmFsdWUoZGF0YS5sZWZ0LCByb3cpIDwgcmVzb2x2ZVZhbHVlKGRhdGEucmlnaHQsIHJvdyk7XG4gICAgY2FzZSBcImx0ZVwiOlxuICAgICAgcmV0dXJuIHJlc29sdmVWYWx1ZShkYXRhLmxlZnQsIHJvdykgPD0gcmVzb2x2ZVZhbHVlKGRhdGEucmlnaHQsIHJvdyk7XG4gICAgY2FzZSBcImFuZFwiOlxuICAgICAgcmV0dXJuIGRhdGEuY2xhdXNlcy5ldmVyeSgoYykgPT4gZXZhbHVhdGVEYXRhKGMsIHJvdykpO1xuICAgIGNhc2UgXCJvclwiOlxuICAgICAgcmV0dXJuIGRhdGEuY2xhdXNlcy5zb21lKChjKSA9PiBldmFsdWF0ZURhdGEoYywgcm93KSk7XG4gICAgY2FzZSBcIm5vdFwiOlxuICAgICAgcmV0dXJuICFldmFsdWF0ZURhdGEoZGF0YS5jbGF1c2UsIHJvdyk7XG4gIH1cbn1cbmZ1bmN0aW9uIHJlc29sdmVWYWx1ZShleHByLCByb3cpIHtcbiAgaWYgKGlzTGl0ZXJhbEV4cHIoZXhwcikpIHtcbiAgICByZXR1cm4gdG9Db21wYXJhYmxlVmFsdWUoZXhwci52YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHRvQ29tcGFyYWJsZVZhbHVlKHJvd1tleHByLmNvbHVtbl0pO1xufVxuZnVuY3Rpb24gaXNIZXhTZXJpYWxpemFibGVMaWtlKHZhbHVlKSB7XG4gIHJldHVybiAhIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgdmFsdWUudG9IZXhTdHJpbmcgPT09IFwiZnVuY3Rpb25cIjtcbn1cbmZ1bmN0aW9uIGlzVGltZXN0YW1wTGlrZSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIGZhbHNlO1xuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBUaW1lc3RhbXApIHJldHVybiB0cnVlO1xuICBjb25zdCBtaWNyb3MgPSB2YWx1ZVtcIl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX19cIl07XG4gIHJldHVybiB0eXBlb2YgbWljcm9zID09PSBcImJpZ2ludFwiO1xufVxuZnVuY3Rpb24gdG9Db21wYXJhYmxlVmFsdWUodmFsdWUpIHtcbiAgaWYgKGlzSGV4U2VyaWFsaXphYmxlTGlrZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWUudG9IZXhTdHJpbmcoKTtcbiAgfVxuICBpZiAoaXNUaW1lc3RhbXBMaWtlKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZS5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIGdldFF1ZXJ5VGFibGVOYW1lKHF1ZXJ5KSB7XG4gIGlmIChxdWVyeS50YWJsZSkgcmV0dXJuIHF1ZXJ5LnRhYmxlLm5hbWU7XG4gIGlmIChxdWVyeS5uYW1lKSByZXR1cm4gcXVlcnkubmFtZTtcbiAgaWYgKHF1ZXJ5LnNvdXJjZVF1ZXJ5KSByZXR1cm4gcXVlcnkuc291cmNlUXVlcnkudGFibGUubmFtZTtcbiAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGV4dHJhY3QgdGFibGUgbmFtZSBmcm9tIHF1ZXJ5XCIpO1xufVxuZnVuY3Rpb24gZ2V0UXVlcnlBY2Nlc3Nvck5hbWUocXVlcnkpIHtcbiAgaWYgKHF1ZXJ5LnRhYmxlKSByZXR1cm4gcXVlcnkudGFibGUuYWNjZXNzb3JOYW1lO1xuICBpZiAocXVlcnkuYWNjZXNzb3JOYW1lKSByZXR1cm4gcXVlcnkuYWNjZXNzb3JOYW1lO1xuICBpZiAocXVlcnkuc291cmNlUXVlcnkpIHJldHVybiBxdWVyeS5zb3VyY2VRdWVyeS50YWJsZS5hY2Nlc3Nvck5hbWU7XG4gIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBleHRyYWN0IGFjY2Vzc29yIG5hbWUgZnJvbSBxdWVyeVwiKTtcbn1cbmZ1bmN0aW9uIGdldFF1ZXJ5V2hlcmVDbGF1c2UocXVlcnkpIHtcbiAgaWYgKHF1ZXJ5LndoZXJlQ2xhdXNlKSByZXR1cm4gcXVlcnkud2hlcmVDbGF1c2U7XG4gIHJldHVybiB2b2lkIDA7XG59XG5cbi8vIHNyYy9zZXJ2ZXIvdmlld3MudHNcbmZ1bmN0aW9uIG1ha2VWaWV3RXhwb3J0KGN0eCwgb3B0cywgcGFyYW1zLCByZXQsIGZuKSB7XG4gIGNvbnN0IHZpZXdFeHBvcnQgPSAoXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0eXBlc2NyaXB0IGluY29ycmVjdGx5IHNheXMgRnVuY3Rpb24jYmluZCByZXF1aXJlcyBhbiBhcmd1bWVudC5cbiAgICBmbi5iaW5kKClcbiAgKTtcbiAgdmlld0V4cG9ydFtleHBvcnRDb250ZXh0XSA9IGN0eDtcbiAgdmlld0V4cG9ydFtyZWdpc3RlckV4cG9ydF0gPSAoY3R4MiwgZXhwb3J0TmFtZSkgPT4ge1xuICAgIHJlZ2lzdGVyVmlldyhjdHgyLCBvcHRzLCBleHBvcnROYW1lLCBwYXJhbXMsIHJldCwgZm4pO1xuICB9O1xuICByZXR1cm4gdmlld0V4cG9ydDtcbn1cbmZ1bmN0aW9uIG1ha2VBbm9uVmlld0V4cG9ydChjdHgsIG9wdHMsIHBhcmFtcywgcmV0LCBmbikge1xuICBjb25zdCB2aWV3RXhwb3J0ID0gKFxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHlwZXNjcmlwdCBpbmNvcnJlY3RseSBzYXlzIEZ1bmN0aW9uI2JpbmQgcmVxdWlyZXMgYW4gYXJndW1lbnQuXG4gICAgZm4uYmluZCgpXG4gICk7XG4gIHZpZXdFeHBvcnRbZXhwb3J0Q29udGV4dF0gPSBjdHg7XG4gIHZpZXdFeHBvcnRbcmVnaXN0ZXJFeHBvcnRdID0gKGN0eDIsIGV4cG9ydE5hbWUpID0+IHtcbiAgICByZWdpc3RlckFub255bW91c1ZpZXcoY3R4Miwgb3B0cywgZXhwb3J0TmFtZSwgcGFyYW1zLCByZXQsIGZuKTtcbiAgfTtcbiAgcmV0dXJuIHZpZXdFeHBvcnQ7XG59XG5mdW5jdGlvbiByZWdpc3RlclZpZXcoY3R4LCBvcHRzLCBleHBvcnROYW1lLCBwYXJhbXMsIHJldCwgZm4pIHtcbiAgY29uc3QgZGVzY3JpYmVkID0gZGVzY3JpYmVWaWV3KGN0eCwgb3B0cywgZXhwb3J0TmFtZSwgZmFsc2UsIHBhcmFtcywgcmV0KTtcbiAgY3R4LnZpZXdzLnB1c2goYnVpbGRWaWV3SW5mbyhjdHgsIGRlc2NyaWJlZCwgZm4pKTtcbn1cbmZ1bmN0aW9uIHJlZ2lzdGVyQW5vbnltb3VzVmlldyhjdHgsIG9wdHMsIGV4cG9ydE5hbWUsIHBhcmFtcywgcmV0LCBmbikge1xuICBjb25zdCBkZXNjcmliZWQgPSBkZXNjcmliZVZpZXcoY3R4LCBvcHRzLCBleHBvcnROYW1lLCB0cnVlLCBwYXJhbXMsIHJldCk7XG4gIGN0eC5hbm9uVmlld3MucHVzaChidWlsZFZpZXdJbmZvKGN0eCwgZGVzY3JpYmVkLCBmbikpO1xufVxuZnVuY3Rpb24gZGVzY3JpYmVWaWV3KGN0eCwgb3B0cywgZXhwb3J0TmFtZSwgYW5vbiwgcGFyYW1zLCByZXQpIHtcbiAgY3R4LmRlZmluZUZ1bmN0aW9uKGV4cG9ydE5hbWUpO1xuICBjb25zdCBwYXJhbXNCdWlsZGVyID0gbmV3IFJvd0J1aWxkZXIocGFyYW1zLCB0b1Bhc2NhbENhc2UoZXhwb3J0TmFtZSkpO1xuICBsZXQgcmV0dXJuVHlwZSA9IGN0eC5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkocmV0KS5hbGdlYnJhaWNUeXBlO1xuICBjb25zdCB7IHZhbHVlOiBwYXJhbVR5cGUgfSA9IGN0eC5yZXNvbHZlVHlwZShcbiAgICBjdHgucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHBhcmFtc0J1aWxkZXIpXG4gICk7XG4gIGN0eC5tb2R1bGVEZWYudmlld3MucHVzaCh7XG4gICAgc291cmNlTmFtZTogZXhwb3J0TmFtZSxcbiAgICBpbmRleDogKGFub24gPyBjdHguYW5vblZpZXdzIDogY3R4LnZpZXdzKS5sZW5ndGgsXG4gICAgaXNQdWJsaWM6IG9wdHMucHVibGljLFxuICAgIGlzQW5vbnltb3VzOiBhbm9uLFxuICAgIHBhcmFtczogcGFyYW1UeXBlLFxuICAgIHJldHVyblR5cGVcbiAgfSk7XG4gIGNvbnN0IHByaW1hcnlLZXlDb2x1bW5zID0gdmlld1ByaW1hcnlLZXlDb2x1bW5zKHJldCk7XG4gIGlmIChwcmltYXJ5S2V5Q29sdW1ucy5sZW5ndGggPiAxKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgIGBWaWV3ICcke2V4cG9ydE5hbWV9JyBjYW4gaGF2ZSBhdCBtb3N0IG9uZSBwcmltYXJ5S2V5KCkgY29sdW1uIG9uIGl0cyByZXR1cm5lZCByb3cgdHlwZTsgZm91bmQgJHtwcmltYXJ5S2V5Q29sdW1ucy5qb2luKFwiLCBcIil9YFxuICAgICk7XG4gIH1cbiAgaWYgKHByaW1hcnlLZXlDb2x1bW5zLmxlbmd0aCA9PT0gMSAmJiBwYXJhbVR5cGUuZWxlbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgY3R4Lm1vZHVsZURlZi52aWV3UHJpbWFyeUtleXMucHVzaCh7XG4gICAgICB2aWV3U291cmNlTmFtZTogZXhwb3J0TmFtZSxcbiAgICAgIGNvbHVtbnM6IHByaW1hcnlLZXlDb2x1bW5zXG4gICAgfSk7XG4gIH1cbiAgaWYgKG9wdHMubmFtZSAhPSBudWxsKSB7XG4gICAgY3R4Lm1vZHVsZURlZi5leHBsaWNpdE5hbWVzLmVudHJpZXMucHVzaCh7XG4gICAgICB0YWc6IFwiRnVuY3Rpb25cIixcbiAgICAgIHZhbHVlOiB7XG4gICAgICAgIHNvdXJjZU5hbWU6IGV4cG9ydE5hbWUsXG4gICAgICAgIGNhbm9uaWNhbE5hbWU6IG9wdHMubmFtZVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGNvbnN0IHdyYXBPcHRpb24gPSByZXR1cm5UeXBlLnRhZyA9PSBcIlN1bVwiO1xuICBpZiAocmV0dXJuVHlwZS50YWcgPT0gXCJTdW1cIikge1xuICAgIHJldHVyblR5cGUgPSBBbGdlYnJhaWNUeXBlLkFycmF5KFxuICAgICAgcmV0dXJuVHlwZS52YWx1ZS52YXJpYW50c1swXS5hbGdlYnJhaWNUeXBlXG4gICAgKTtcbiAgfVxuICByZXR1cm4geyBwYXJhbVR5cGUsIHJldHVyblR5cGUsIHdyYXBPcHRpb24gfTtcbn1cbmZ1bmN0aW9uIGJ1aWxkVmlld0luZm8oY3R4LCB7IHBhcmFtVHlwZSwgcmV0dXJuVHlwZSwgd3JhcE9wdGlvbiB9LCBmbikge1xuICBjb25zdCB7IHR5cGVzcGFjZSB9ID0gY3R4O1xuICByZXR1cm4ge1xuICAgIGZuOiB3cmFwT3B0aW9uID8gKCh2aWV3Q3R4LCBhcmdzKSA9PiB7XG4gICAgICBjb25zdCByZXQgPSBmbih2aWV3Q3R4LCBhcmdzKTtcbiAgICAgIHJldHVybiByZXQgPT0gbnVsbCA/IFtdIDogW3JldF07XG4gICAgfSkgOiBmbixcbiAgICBkZXNlcmlhbGl6ZVBhcmFtczogUHJvZHVjdFR5cGUubWFrZURlc2VyaWFsaXplcihwYXJhbVR5cGUsIHR5cGVzcGFjZSksXG4gICAgc2VyaWFsaXplUmV0dXJuOiBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKHJldHVyblR5cGUsIHR5cGVzcGFjZSksXG4gICAgcmV0dXJuVHlwZUJhc2VTaXplOiBic2F0bkJhc2VTaXplKHR5cGVzcGFjZSwgcmV0dXJuVHlwZSlcbiAgfTtcbn1cbmZ1bmN0aW9uIHZpZXdQcmltYXJ5S2V5Q29sdW1ucyhyZXQpIHtcbiAgY29uc3Qgcm93ID0gdmlld1JldHVyblJvdyhyZXQpO1xuICBpZiAocm93ID09IG51bGwpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKHJvdy5yb3cpLmZpbHRlcihcbiAgICAoZW50cnkpID0+IGVudHJ5WzFdLmNvbHVtbk1ldGFkYXRhLmlzUHJpbWFyeUtleSA9PT0gdHJ1ZVxuICApLm1hcCgoW25hbWVdKSA9PiBuYW1lKTtcbn1cbmZ1bmN0aW9uIHZpZXdSZXR1cm5Sb3cocmV0KSB7XG4gIGlmIChyZXQgaW5zdGFuY2VvZiBBcnJheUJ1aWxkZXIgJiYgcmV0LmVsZW1lbnQgaW5zdGFuY2VvZiBSb3dCdWlsZGVyKSB7XG4gICAgcmV0dXJuIHJldC5lbGVtZW50O1xuICB9XG4gIGlmIChyZXQgaW5zdGFuY2VvZiBPcHRpb25CdWlsZGVyICYmIHJldC52YWx1ZSBpbnN0YW5jZW9mIFJvd0J1aWxkZXIpIHtcbiAgICByZXR1cm4gcmV0LnZhbHVlO1xuICB9XG4gIHJldHVybiB2b2lkIDA7XG59XG5cbi8vIHNyYy9saWIvZXJyb3JzLnRzXG52YXIgU2VuZGVyRXJyb3IgPSBjbGFzcyBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICB9XG4gIGdldCBuYW1lKCkge1xuICAgIHJldHVybiBcIlNlbmRlckVycm9yXCI7XG4gIH1cbn07XG5cbi8vIHNyYy9zZXJ2ZXIvZXJyb3JzLnRzXG52YXIgU3BhY2V0aW1lSG9zdEVycm9yID0gY2xhc3MgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxuICBnZXQgbmFtZSgpIHtcbiAgICByZXR1cm4gXCJTcGFjZXRpbWVIb3N0RXJyb3JcIjtcbiAgfVxufTtcbnZhciBlcnJvckRhdGEgPSB7XG4gIC8qKlxuICAgKiBBIGdlbmVyaWMgZXJyb3IgY2xhc3MgZm9yIHVua25vd24gZXJyb3IgY29kZXMuXG4gICAqL1xuICBIb3N0Q2FsbEZhaWx1cmU6IDEsXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYW4gQUJJIGNhbGwgd2FzIG1hZGUgb3V0c2lkZSBvZiBhIHRyYW5zYWN0aW9uLlxuICAgKi9cbiAgTm90SW5UcmFuc2FjdGlvbjogMixcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBCU0FUTiBkZWNvZGluZyBmYWlsZWQuXG4gICAqIFRoaXMgdHlwaWNhbGx5IG1lYW5zIHRoYXQgdGhlIGRhdGEgY291bGQgbm90IGJlIGRlY29kZWQgdG8gdGhlIGV4cGVjdGVkIHR5cGUuXG4gICAqL1xuICBCc2F0bkRlY29kZUVycm9yOiAzLFxuICAvKipcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGEgc3BlY2lmaWVkIHRhYmxlIGRvZXMgbm90IGV4aXN0LlxuICAgKi9cbiAgTm9TdWNoVGFibGU6IDQsXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYSBzcGVjaWZpZWQgaW5kZXggZG9lcyBub3QgZXhpc3QuXG4gICAqL1xuICBOb1N1Y2hJbmRleDogNSxcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHNwZWNpZmllZCByb3cgaXRlcmF0b3IgaXMgbm90IHZhbGlkLlxuICAgKi9cbiAgTm9TdWNoSXRlcjogNixcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHNwZWNpZmllZCBjb25zb2xlIHRpbWVyIGRvZXMgbm90IGV4aXN0LlxuICAgKi9cbiAgTm9TdWNoQ29uc29sZVRpbWVyOiA3LFxuICAvKipcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGEgc3BlY2lmaWVkIGJ5dGVzIHNvdXJjZSBvciBzaW5rIGlzIG5vdCB2YWxpZC5cbiAgICovXG4gIE5vU3VjaEJ5dGVzOiA4LFxuICAvKipcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGEgcHJvdmlkZWQgc2luayBoYXMgbm8gbW9yZSBzcGFjZSBsZWZ0LlxuICAgKi9cbiAgTm9TcGFjZTogOSxcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCB0aGVyZSBpcyBubyBtb3JlIHNwYWNlIGluIHRoZSBkYXRhYmFzZS5cbiAgICovXG4gIEJ1ZmZlclRvb1NtYWxsOiAxMSxcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHZhbHVlIHdpdGggYSBnaXZlbiB1bmlxdWUgaWRlbnRpZmllciBhbHJlYWR5IGV4aXN0cy5cbiAgICovXG4gIFVuaXF1ZUFscmVhZHlFeGlzdHM6IDEyLFxuICAvKipcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IHRoZSBzcGVjaWZpZWQgZGVsYXkgaW4gc2NoZWR1bGluZyBhIHJvdyB3YXMgdG9vIGxvbmcuXG4gICAqL1xuICBTY2hlZHVsZUF0RGVsYXlUb29Mb25nOiAxMyxcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhbiBpbmRleCB3YXMgbm90IHVuaXF1ZSB3aGVuIGl0IHdhcyBleHBlY3RlZCB0byBiZS5cbiAgICovXG4gIEluZGV4Tm90VW5pcXVlOiAxNCxcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhbiBpbmRleCB3YXMgbm90IHVuaXF1ZSB3aGVuIGl0IHdhcyBleHBlY3RlZCB0byBiZS5cbiAgICovXG4gIE5vU3VjaFJvdzogMTUsXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYW4gYXV0by1pbmNyZW1lbnQgc2VxdWVuY2UgaGFzIG92ZXJmbG93ZWQuXG4gICAqL1xuICBBdXRvSW5jT3ZlcmZsb3c6IDE2LFxuICBXb3VsZEJsb2NrVHJhbnNhY3Rpb246IDE3LFxuICBUcmFuc2FjdGlvbk5vdEFub255bW91czogMTgsXG4gIFRyYW5zYWN0aW9uSXNSZWFkT25seTogMTksXG4gIFRyYW5zYWN0aW9uSXNNdXQ6IDIwLFxuICBIdHRwRXJyb3I6IDIxXG59O1xuZnVuY3Rpb24gbWFwRW50cmllcyh4LCBmKSB7XG4gIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMoeCkubWFwKChbaywgdl0pID0+IFtrLCBmKGssIHYpXSlcbiAgKTtcbn1cbnZhciBlcnJub1RvQ2xhc3MgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xudmFyIGVycm9ycyA9IE9iamVjdC5mcmVlemUoXG4gIG1hcEVudHJpZXMoZXJyb3JEYXRhLCAobmFtZSwgY29kZSkgPT4ge1xuICAgIGNvbnN0IGNscyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShcbiAgICAgIGNsYXNzIGV4dGVuZHMgU3BhY2V0aW1lSG9zdEVycm9yIHtcbiAgICAgICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcIm5hbWVcIixcbiAgICAgIHsgdmFsdWU6IG5hbWUsIHdyaXRhYmxlOiBmYWxzZSB9XG4gICAgKTtcbiAgICBlcnJub1RvQ2xhc3Muc2V0KGNvZGUsIGNscyk7XG4gICAgcmV0dXJuIGNscztcbiAgfSlcbik7XG5mdW5jdGlvbiBnZXRFcnJvckNvbnN0cnVjdG9yKGNvZGUpIHtcbiAgcmV0dXJuIGVycm5vVG9DbGFzcy5nZXQoY29kZSkgPz8gU3BhY2V0aW1lSG9zdEVycm9yO1xufVxuXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHVyZS1yYW5kQDcuMC4xL25vZGVfbW9kdWxlcy9wdXJlLXJhbmQvbGliL2VzbS9kaXN0cmlidXRpb24vVW5zYWZlVW5pZm9ybUJpZ0ludERpc3RyaWJ1dGlvbi5qc1xudmFyIFNCaWdJbnQgPSB0eXBlb2YgQmlnSW50ICE9PSBcInVuZGVmaW5lZFwiID8gQmlnSW50IDogdm9pZCAwO1xudmFyIE9uZSA9IHR5cGVvZiBCaWdJbnQgIT09IFwidW5kZWZpbmVkXCIgPyBCaWdJbnQoMSkgOiB2b2lkIDA7XG52YXIgVGhpcnR5VHdvID0gdHlwZW9mIEJpZ0ludCAhPT0gXCJ1bmRlZmluZWRcIiA/IEJpZ0ludCgzMikgOiB2b2lkIDA7XG52YXIgTnVtVmFsdWVzID0gdHlwZW9mIEJpZ0ludCAhPT0gXCJ1bmRlZmluZWRcIiA/IEJpZ0ludCg0Mjk0OTY3Mjk2KSA6IHZvaWQgMDtcbmZ1bmN0aW9uIHVuc2FmZVVuaWZvcm1CaWdJbnREaXN0cmlidXRpb24oZnJvbSwgdG8sIHJuZykge1xuICB2YXIgZGlmZiA9IHRvIC0gZnJvbSArIE9uZTtcbiAgdmFyIEZpbmFsTnVtVmFsdWVzID0gTnVtVmFsdWVzO1xuICB2YXIgTnVtSXRlcmF0aW9ucyA9IDE7XG4gIHdoaWxlIChGaW5hbE51bVZhbHVlcyA8IGRpZmYpIHtcbiAgICBGaW5hbE51bVZhbHVlcyA8PD0gVGhpcnR5VHdvO1xuICAgICsrTnVtSXRlcmF0aW9ucztcbiAgfVxuICB2YXIgdmFsdWUgPSBnZW5lcmF0ZU5leHQoTnVtSXRlcmF0aW9ucywgcm5nKTtcbiAgaWYgKHZhbHVlIDwgZGlmZikge1xuICAgIHJldHVybiB2YWx1ZSArIGZyb207XG4gIH1cbiAgaWYgKHZhbHVlICsgZGlmZiA8IEZpbmFsTnVtVmFsdWVzKSB7XG4gICAgcmV0dXJuIHZhbHVlICUgZGlmZiArIGZyb207XG4gIH1cbiAgdmFyIE1heEFjY2VwdGVkUmFuZG9tID0gRmluYWxOdW1WYWx1ZXMgLSBGaW5hbE51bVZhbHVlcyAlIGRpZmY7XG4gIHdoaWxlICh2YWx1ZSA+PSBNYXhBY2NlcHRlZFJhbmRvbSkge1xuICAgIHZhbHVlID0gZ2VuZXJhdGVOZXh0KE51bUl0ZXJhdGlvbnMsIHJuZyk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlICUgZGlmZiArIGZyb207XG59XG5mdW5jdGlvbiBnZW5lcmF0ZU5leHQoTnVtSXRlcmF0aW9ucywgcm5nKSB7XG4gIHZhciB2YWx1ZSA9IFNCaWdJbnQocm5nLnVuc2FmZU5leHQoKSArIDIxNDc0ODM2NDgpO1xuICBmb3IgKHZhciBudW0gPSAxOyBudW0gPCBOdW1JdGVyYXRpb25zOyArK251bSkge1xuICAgIHZhciBvdXQgPSBybmcudW5zYWZlTmV4dCgpO1xuICAgIHZhbHVlID0gKHZhbHVlIDw8IFRoaXJ0eVR3bykgKyBTQmlnSW50KG91dCArIDIxNDc0ODM2NDgpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3B1cmUtcmFuZEA3LjAuMS9ub2RlX21vZHVsZXMvcHVyZS1yYW5kL2xpYi9lc20vZGlzdHJpYnV0aW9uL2ludGVybmFscy9VbnNhZmVVbmlmb3JtSW50RGlzdHJpYnV0aW9uSW50ZXJuYWwuanNcbmZ1bmN0aW9uIHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb25JbnRlcm5hbChyYW5nZVNpemUsIHJuZykge1xuICB2YXIgTWF4QWxsb3dlZCA9IHJhbmdlU2l6ZSA+IDIgPyB+fig0Mjk0OTY3Mjk2IC8gcmFuZ2VTaXplKSAqIHJhbmdlU2l6ZSA6IDQyOTQ5NjcyOTY7XG4gIHZhciBkZWx0YVYgPSBybmcudW5zYWZlTmV4dCgpICsgMjE0NzQ4MzY0ODtcbiAgd2hpbGUgKGRlbHRhViA+PSBNYXhBbGxvd2VkKSB7XG4gICAgZGVsdGFWID0gcm5nLnVuc2FmZU5leHQoKSArIDIxNDc0ODM2NDg7XG4gIH1cbiAgcmV0dXJuIGRlbHRhViAlIHJhbmdlU2l6ZTtcbn1cblxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3B1cmUtcmFuZEA3LjAuMS9ub2RlX21vZHVsZXMvcHVyZS1yYW5kL2xpYi9lc20vZGlzdHJpYnV0aW9uL2ludGVybmFscy9BcnJheUludDY0LmpzXG5mdW5jdGlvbiBmcm9tTnVtYmVyVG9BcnJheUludDY0KG91dCwgbikge1xuICBpZiAobiA8IDApIHtcbiAgICB2YXIgcG9zTiA9IC1uO1xuICAgIG91dC5zaWduID0gLTE7XG4gICAgb3V0LmRhdGFbMF0gPSB+fihwb3NOIC8gNDI5NDk2NzI5Nik7XG4gICAgb3V0LmRhdGFbMV0gPSBwb3NOID4+PiAwO1xuICB9IGVsc2Uge1xuICAgIG91dC5zaWduID0gMTtcbiAgICBvdXQuZGF0YVswXSA9IH5+KG4gLyA0Mjk0OTY3Mjk2KTtcbiAgICBvdXQuZGF0YVsxXSA9IG4gPj4+IDA7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cbmZ1bmN0aW9uIHN1YnN0cmFjdEFycmF5SW50NjQob3V0LCBhcnJheUludEEsIGFycmF5SW50Qikge1xuICB2YXIgbG93QSA9IGFycmF5SW50QS5kYXRhWzFdO1xuICB2YXIgaGlnaEEgPSBhcnJheUludEEuZGF0YVswXTtcbiAgdmFyIHNpZ25BID0gYXJyYXlJbnRBLnNpZ247XG4gIHZhciBsb3dCID0gYXJyYXlJbnRCLmRhdGFbMV07XG4gIHZhciBoaWdoQiA9IGFycmF5SW50Qi5kYXRhWzBdO1xuICB2YXIgc2lnbkIgPSBhcnJheUludEIuc2lnbjtcbiAgb3V0LnNpZ24gPSAxO1xuICBpZiAoc2lnbkEgPT09IDEgJiYgc2lnbkIgPT09IC0xKSB7XG4gICAgdmFyIGxvd18xID0gbG93QSArIGxvd0I7XG4gICAgdmFyIGhpZ2ggPSBoaWdoQSArIGhpZ2hCICsgKGxvd18xID4gNDI5NDk2NzI5NSA/IDEgOiAwKTtcbiAgICBvdXQuZGF0YVswXSA9IGhpZ2ggPj4+IDA7XG4gICAgb3V0LmRhdGFbMV0gPSBsb3dfMSA+Pj4gMDtcbiAgICByZXR1cm4gb3V0O1xuICB9XG4gIHZhciBsb3dGaXJzdCA9IGxvd0E7XG4gIHZhciBoaWdoRmlyc3QgPSBoaWdoQTtcbiAgdmFyIGxvd1NlY29uZCA9IGxvd0I7XG4gIHZhciBoaWdoU2Vjb25kID0gaGlnaEI7XG4gIGlmIChzaWduQSA9PT0gLTEpIHtcbiAgICBsb3dGaXJzdCA9IGxvd0I7XG4gICAgaGlnaEZpcnN0ID0gaGlnaEI7XG4gICAgbG93U2Vjb25kID0gbG93QTtcbiAgICBoaWdoU2Vjb25kID0gaGlnaEE7XG4gIH1cbiAgdmFyIHJlbWluZGVyTG93ID0gMDtcbiAgdmFyIGxvdyA9IGxvd0ZpcnN0IC0gbG93U2Vjb25kO1xuICBpZiAobG93IDwgMCkge1xuICAgIHJlbWluZGVyTG93ID0gMTtcbiAgICBsb3cgPSBsb3cgPj4+IDA7XG4gIH1cbiAgb3V0LmRhdGFbMF0gPSBoaWdoRmlyc3QgLSBoaWdoU2Vjb25kIC0gcmVtaW5kZXJMb3c7XG4gIG91dC5kYXRhWzFdID0gbG93O1xuICByZXR1cm4gb3V0O1xufVxuXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHVyZS1yYW5kQDcuMC4xL25vZGVfbW9kdWxlcy9wdXJlLXJhbmQvbGliL2VzbS9kaXN0cmlidXRpb24vaW50ZXJuYWxzL1Vuc2FmZVVuaWZvcm1BcnJheUludERpc3RyaWJ1dGlvbkludGVybmFsLmpzXG5mdW5jdGlvbiB1bnNhZmVVbmlmb3JtQXJyYXlJbnREaXN0cmlidXRpb25JbnRlcm5hbChvdXQsIHJhbmdlU2l6ZSwgcm5nKSB7XG4gIHZhciByYW5nZUxlbmd0aCA9IHJhbmdlU2l6ZS5sZW5ndGg7XG4gIHdoaWxlICh0cnVlKSB7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCAhPT0gcmFuZ2VMZW5ndGg7ICsraW5kZXgpIHtcbiAgICAgIHZhciBpbmRleFJhbmdlU2l6ZSA9IGluZGV4ID09PSAwID8gcmFuZ2VTaXplWzBdICsgMSA6IDQyOTQ5NjcyOTY7XG4gICAgICB2YXIgZyA9IHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb25JbnRlcm5hbChpbmRleFJhbmdlU2l6ZSwgcm5nKTtcbiAgICAgIG91dFtpbmRleF0gPSBnO1xuICAgIH1cbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4ICE9PSByYW5nZUxlbmd0aDsgKytpbmRleCkge1xuICAgICAgdmFyIGN1cnJlbnQgPSBvdXRbaW5kZXhdO1xuICAgICAgdmFyIGN1cnJlbnRJblJhbmdlID0gcmFuZ2VTaXplW2luZGV4XTtcbiAgICAgIGlmIChjdXJyZW50IDwgY3VycmVudEluUmFuZ2UpIHtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgIH0gZWxzZSBpZiAoY3VycmVudCA+IGN1cnJlbnRJblJhbmdlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHVyZS1yYW5kQDcuMC4xL25vZGVfbW9kdWxlcy9wdXJlLXJhbmQvbGliL2VzbS9kaXN0cmlidXRpb24vVW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbi5qc1xudmFyIHNhZmVOdW1iZXJNYXhTYWZlSW50ZWdlciA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xudmFyIHNoYXJlZEEgPSB7IHNpZ246IDEsIGRhdGE6IFswLCAwXSB9O1xudmFyIHNoYXJlZEIgPSB7IHNpZ246IDEsIGRhdGE6IFswLCAwXSB9O1xudmFyIHNoYXJlZEMgPSB7IHNpZ246IDEsIGRhdGE6IFswLCAwXSB9O1xudmFyIHNoYXJlZERhdGEgPSBbMCwgMF07XG5mdW5jdGlvbiB1bmlmb3JtTGFyZ2VJbnRJbnRlcm5hbChmcm9tLCB0bywgcmFuZ2VTaXplLCBybmcpIHtcbiAgdmFyIHJhbmdlU2l6ZUFycmF5SW50VmFsdWUgPSByYW5nZVNpemUgPD0gc2FmZU51bWJlck1heFNhZmVJbnRlZ2VyID8gZnJvbU51bWJlclRvQXJyYXlJbnQ2NChzaGFyZWRDLCByYW5nZVNpemUpIDogc3Vic3RyYWN0QXJyYXlJbnQ2NChzaGFyZWRDLCBmcm9tTnVtYmVyVG9BcnJheUludDY0KHNoYXJlZEEsIHRvKSwgZnJvbU51bWJlclRvQXJyYXlJbnQ2NChzaGFyZWRCLCBmcm9tKSk7XG4gIGlmIChyYW5nZVNpemVBcnJheUludFZhbHVlLmRhdGFbMV0gPT09IDQyOTQ5NjcyOTUpIHtcbiAgICByYW5nZVNpemVBcnJheUludFZhbHVlLmRhdGFbMF0gKz0gMTtcbiAgICByYW5nZVNpemVBcnJheUludFZhbHVlLmRhdGFbMV0gPSAwO1xuICB9IGVsc2Uge1xuICAgIHJhbmdlU2l6ZUFycmF5SW50VmFsdWUuZGF0YVsxXSArPSAxO1xuICB9XG4gIHVuc2FmZVVuaWZvcm1BcnJheUludERpc3RyaWJ1dGlvbkludGVybmFsKHNoYXJlZERhdGEsIHJhbmdlU2l6ZUFycmF5SW50VmFsdWUuZGF0YSwgcm5nKTtcbiAgcmV0dXJuIHNoYXJlZERhdGFbMF0gKiA0Mjk0OTY3Mjk2ICsgc2hhcmVkRGF0YVsxXSArIGZyb207XG59XG5mdW5jdGlvbiB1bnNhZmVVbmlmb3JtSW50RGlzdHJpYnV0aW9uKGZyb20sIHRvLCBybmcpIHtcbiAgdmFyIHJhbmdlU2l6ZSA9IHRvIC0gZnJvbTtcbiAgaWYgKHJhbmdlU2l6ZSA8PSA0Mjk0OTY3Mjk1KSB7XG4gICAgdmFyIGcgPSB1bnNhZmVVbmlmb3JtSW50RGlzdHJpYnV0aW9uSW50ZXJuYWwocmFuZ2VTaXplICsgMSwgcm5nKTtcbiAgICByZXR1cm4gZyArIGZyb207XG4gIH1cbiAgcmV0dXJuIHVuaWZvcm1MYXJnZUludEludGVybmFsKGZyb20sIHRvLCByYW5nZVNpemUsIHJuZyk7XG59XG5cbi8vIC4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9wdXJlLXJhbmRANy4wLjEvbm9kZV9tb2R1bGVzL3B1cmUtcmFuZC9saWIvZXNtL2dlbmVyYXRvci9Yb3JvU2hpcm8uanNcbnZhciBYb3JvU2hpcm8xMjhQbHVzID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBYb3JvU2hpcm8xMjhQbHVzMihzMDEsIHMwMCwgczExLCBzMTApIHtcbiAgICB0aGlzLnMwMSA9IHMwMTtcbiAgICB0aGlzLnMwMCA9IHMwMDtcbiAgICB0aGlzLnMxMSA9IHMxMTtcbiAgICB0aGlzLnMxMCA9IHMxMDtcbiAgfVxuICBYb3JvU2hpcm8xMjhQbHVzMi5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFhvcm9TaGlybzEyOFBsdXMyKHRoaXMuczAxLCB0aGlzLnMwMCwgdGhpcy5zMTEsIHRoaXMuczEwKTtcbiAgfTtcbiAgWG9yb1NoaXJvMTI4UGx1czIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbmV4dFJuZyA9IG5ldyBYb3JvU2hpcm8xMjhQbHVzMih0aGlzLnMwMSwgdGhpcy5zMDAsIHRoaXMuczExLCB0aGlzLnMxMCk7XG4gICAgdmFyIG91dCA9IG5leHRSbmcudW5zYWZlTmV4dCgpO1xuICAgIHJldHVybiBbb3V0LCBuZXh0Um5nXTtcbiAgfTtcbiAgWG9yb1NoaXJvMTI4UGx1czIucHJvdG90eXBlLnVuc2FmZU5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gdGhpcy5zMDAgKyB0aGlzLnMxMCB8IDA7XG4gICAgdmFyIGEwID0gdGhpcy5zMTAgXiB0aGlzLnMwMDtcbiAgICB2YXIgYTEgPSB0aGlzLnMxMSBeIHRoaXMuczAxO1xuICAgIHZhciBzMDAgPSB0aGlzLnMwMDtcbiAgICB2YXIgczAxID0gdGhpcy5zMDE7XG4gICAgdGhpcy5zMDAgPSBzMDAgPDwgMjQgXiBzMDEgPj4+IDggXiBhMCBeIGEwIDw8IDE2O1xuICAgIHRoaXMuczAxID0gczAxIDw8IDI0IF4gczAwID4+PiA4IF4gYTEgXiAoYTEgPDwgMTYgfCBhMCA+Pj4gMTYpO1xuICAgIHRoaXMuczEwID0gYTEgPDwgNSBeIGEwID4+PiAyNztcbiAgICB0aGlzLnMxMSA9IGEwIDw8IDUgXiBhMSA+Pj4gMjc7XG4gICAgcmV0dXJuIG91dDtcbiAgfTtcbiAgWG9yb1NoaXJvMTI4UGx1czIucHJvdG90eXBlLmp1bXAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbmV4dFJuZyA9IG5ldyBYb3JvU2hpcm8xMjhQbHVzMih0aGlzLnMwMSwgdGhpcy5zMDAsIHRoaXMuczExLCB0aGlzLnMxMCk7XG4gICAgbmV4dFJuZy51bnNhZmVKdW1wKCk7XG4gICAgcmV0dXJuIG5leHRSbmc7XG4gIH07XG4gIFhvcm9TaGlybzEyOFBsdXMyLnByb3RvdHlwZS51bnNhZmVKdW1wID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5zMDEgPSAwO1xuICAgIHZhciBuczAwID0gMDtcbiAgICB2YXIgbnMxMSA9IDA7XG4gICAgdmFyIG5zMTAgPSAwO1xuICAgIHZhciBqdW1wID0gWzM2Mzk5NTY2NDUsIDM3NTA3NTcwMTIsIDEyNjE1Njg1MDgsIDM4NjQyNjMzNV07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgIT09IDQ7ICsraSkge1xuICAgICAgZm9yICh2YXIgbWFzayA9IDE7IG1hc2s7IG1hc2sgPDw9IDEpIHtcbiAgICAgICAgaWYgKGp1bXBbaV0gJiBtYXNrKSB7XG4gICAgICAgICAgbnMwMSBePSB0aGlzLnMwMTtcbiAgICAgICAgICBuczAwIF49IHRoaXMuczAwO1xuICAgICAgICAgIG5zMTEgXj0gdGhpcy5zMTE7XG4gICAgICAgICAgbnMxMCBePSB0aGlzLnMxMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVuc2FmZU5leHQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zMDEgPSBuczAxO1xuICAgIHRoaXMuczAwID0gbnMwMDtcbiAgICB0aGlzLnMxMSA9IG5zMTE7XG4gICAgdGhpcy5zMTAgPSBuczEwO1xuICB9O1xuICBYb3JvU2hpcm8xMjhQbHVzMi5wcm90b3R5cGUuZ2V0U3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gW3RoaXMuczAxLCB0aGlzLnMwMCwgdGhpcy5zMTEsIHRoaXMuczEwXTtcbiAgfTtcbiAgcmV0dXJuIFhvcm9TaGlybzEyOFBsdXMyO1xufSkoKTtcbmZ1bmN0aW9uIGZyb21TdGF0ZShzdGF0ZSkge1xuICB2YXIgdmFsaWQgPSBzdGF0ZS5sZW5ndGggPT09IDQ7XG4gIGlmICghdmFsaWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgc3RhdGUgbXVzdCBoYXZlIGJlZW4gcHJvZHVjZWQgYnkgYSB4b3Jvc2hpcm8xMjhwbHVzIFJhbmRvbUdlbmVyYXRvclwiKTtcbiAgfVxuICByZXR1cm4gbmV3IFhvcm9TaGlybzEyOFBsdXMoc3RhdGVbMF0sIHN0YXRlWzFdLCBzdGF0ZVsyXSwgc3RhdGVbM10pO1xufVxudmFyIHhvcm9zaGlybzEyOHBsdXMgPSBPYmplY3QuYXNzaWduKGZ1bmN0aW9uKHNlZWQpIHtcbiAgcmV0dXJuIG5ldyBYb3JvU2hpcm8xMjhQbHVzKC0xLCB+c2VlZCwgc2VlZCB8IDAsIDApO1xufSwgeyBmcm9tU3RhdGUgfSk7XG5cbi8vIHNyYy9zZXJ2ZXIvcm5nLnRzXG52YXIgeyBhc1VpbnROIH0gPSBCaWdJbnQ7XG5mdW5jdGlvbiBwY2czMihzdGF0ZSkge1xuICBjb25zdCBNVUwgPSA2MzY0MTM2MjIzODQ2NzkzMDA1bjtcbiAgY29uc3QgSU5DID0gMTE2MzQ1ODAwMjc0NjIyNjA3MjNuO1xuICBzdGF0ZSA9IGFzVWludE4oNjQsIHN0YXRlICogTVVMICsgSU5DKTtcbiAgY29uc3QgeG9yc2hpZnRlZCA9IE51bWJlcihhc1VpbnROKDMyLCAoc3RhdGUgPj4gMThuIF4gc3RhdGUpID4+IDI3bikpO1xuICBjb25zdCByb3QgPSBOdW1iZXIoYXNVaW50TigzMiwgc3RhdGUgPj4gNTluKSk7XG4gIHJldHVybiB4b3JzaGlmdGVkID4+IHJvdCB8IHhvcnNoaWZ0ZWQgPDwgMzIgLSByb3Q7XG59XG5mdW5jdGlvbiBnZW5lcmF0ZUZsb2F0NjQocm5nKSB7XG4gIGNvbnN0IGcxID0gdW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbigwLCAoMSA8PCAyNikgLSAxLCBybmcpO1xuICBjb25zdCBnMiA9IHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb24oMCwgKDEgPDwgMjcpIC0gMSwgcm5nKTtcbiAgY29uc3QgdmFsdWUgPSAoZzEgKiBNYXRoLnBvdygyLCAyNykgKyBnMikgKiBNYXRoLnBvdygyLCAtNTMpO1xuICByZXR1cm4gdmFsdWU7XG59XG5mdW5jdGlvbiBtYWtlUmFuZG9tRnJvbVNlZWQoc2VlZCkge1xuICBjb25zdCBybmcgPSB4b3Jvc2hpcm8xMjhwbHVzKHBjZzMyKHNlZWRUb0JpZ0ludChzZWVkKSkpO1xuICBjb25zdCByYW5kb20gPSAoKSA9PiBnZW5lcmF0ZUZsb2F0NjQocm5nKTtcbiAgcmFuZG9tLmZpbGwgPSAoYXJyYXkpID0+IHtcbiAgICBpZiAoaXNCaWdJbnRBcnJheShhcnJheSkpIHtcbiAgICAgIGNvbnN0IHVwcGVyID0gKDFuIDw8IEJpZ0ludChhcnJheS5CWVRFU19QRVJfRUxFTUVOVCAqIDgpKSAtIDFuO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICBhcnJheVtpXSA9IHVuc2FmZVVuaWZvcm1CaWdJbnREaXN0cmlidXRpb24oMG4sIHVwcGVyLCBybmcpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB1cHBlciA9IE1hdGgucG93KDIsIGFycmF5LkJZVEVTX1BFUl9FTEVNRU5UICogOCkgLSAxO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICBhcnJheVtpXSA9IHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb24oMCwgdXBwZXIsIHJuZyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbiAgfTtcbiAgcmFuZG9tLnNodWZmbGUgPSAoYXJyYXkpID0+IHtcbiAgICBmb3IgKGxldCBjdXJyZW50SW5kZXggPSBhcnJheS5sZW5ndGggLSAxOyBjdXJyZW50SW5kZXggPiAwOyBjdXJyZW50SW5kZXgtLSkge1xuICAgICAgY29uc3Qgc3dhcEluZGV4ID0gcmFuZG9tLmludGVnZXJJblJhbmdlKDAsIGN1cnJlbnRJbmRleCk7XG4gICAgICBbYXJyYXlbY3VycmVudEluZGV4XSwgYXJyYXlbc3dhcEluZGV4XV0gPSBbXG4gICAgICAgIGFycmF5W3N3YXBJbmRleF0sXG4gICAgICAgIGFycmF5W2N1cnJlbnRJbmRleF1cbiAgICAgIF07XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbiAgfTtcbiAgcmFuZG9tLnVpbnQzMiA9ICgpID0+IHJuZy51bnNhZmVOZXh0KCk7XG4gIHJhbmRvbS5pbnRlZ2VySW5SYW5nZSA9IChtaW4sIG1heCkgPT4gdW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbihtaW4sIG1heCwgcm5nKTtcbiAgcmFuZG9tLmJpZ2ludEluUmFuZ2UgPSAobWluLCBtYXgpID0+IHVuc2FmZVVuaWZvcm1CaWdJbnREaXN0cmlidXRpb24obWluLCBtYXgsIHJuZyk7XG4gIHJldHVybiByYW5kb207XG59XG5mdW5jdGlvbiBtYWtlUmFuZG9tKHNlZWQpIHtcbiAgcmV0dXJuIG1ha2VSYW5kb21Gcm9tU2VlZChzZWVkKTtcbn1cbmZ1bmN0aW9uIHNlZWRUb0JpZ0ludChzZWVkKSB7XG4gIGlmICh0eXBlb2Ygc2VlZCA9PT0gXCJiaWdpbnRcIikgcmV0dXJuIHNlZWQ7XG4gIGlmICh0eXBlb2Ygc2VlZCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIEJpZ0ludChzZWVkKTtcbiAgaWYgKHNlZWQgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgbGV0IHZhbHVlID0gMG47XG4gICAgY29uc3QgbGVuID0gTWF0aC5taW4oc2VlZC5ieXRlTGVuZ3RoLCA4KTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2YWx1ZSB8PSBCaWdJbnQoc2VlZFtpXSkgPDwgQmlnSW50KGkgKiA4KTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJldHVybiBzZWVkLm1pY3Jvc1NpbmNlVW5peEVwb2NoO1xufVxuZnVuY3Rpb24gaXNCaWdJbnRBcnJheShhcnJheSkge1xuICByZXR1cm4gYXJyYXkgaW5zdGFuY2VvZiBCaWdJbnQ2NEFycmF5IHx8IGFycmF5IGluc3RhbmNlb2YgQmlnVWludDY0QXJyYXk7XG59XG52YXIgc3lzID0geyAuLi5fc3lzY2FsbHMyXzAsIC4uLl9zeXNjYWxsczJfMSB9O1xudmFyIGhvc3RCYWNrZW5kID0ge1xuICAvLyBEaXJlY3QgcmVmZXJlbmNlcyBrZWVwIGJhY2tlbmQgaW5qZWN0aW9uIGZyb20gYWRkaW5nIGEgd3JhcHBlciBjYWxsIHRvIHRoZSBob3N0IGhvdCBwYXRoLlxuICBpZGVudGl0eTogc3lzLmlkZW50aXR5LFxuICBnZXRKd3RQYXlsb2FkOiBzeXMuZ2V0X2p3dF9wYXlsb2FkLFxuICB0YWJsZUlkRnJvbU5hbWU6IHN5cy50YWJsZV9pZF9mcm9tX25hbWUsXG4gIGluZGV4SWRGcm9tTmFtZTogc3lzLmluZGV4X2lkX2Zyb21fbmFtZSxcbiAgZGF0YXN0b3JlVGFibGVSb3dDb3VudDogc3lzLmRhdGFzdG9yZV90YWJsZV9yb3dfY291bnQsXG4gIGRhdGFzdG9yZVRhYmxlU2NhbkJzYXRuOiBzeXMuZGF0YXN0b3JlX3RhYmxlX3NjYW5fYnNhdG4sXG4gIGRhdGFzdG9yZUluc2VydEJzYXRuOiBzeXMuZGF0YXN0b3JlX2luc2VydF9ic2F0bixcbiAgZGF0YXN0b3JlRGVsZXRlQWxsQnlFcUJzYXRuOiBzeXMuZGF0YXN0b3JlX2RlbGV0ZV9hbGxfYnlfZXFfYnNhdG4sXG4gIGRhdGFzdG9yZUluZGV4U2NhblBvaW50QnNhdG46IHN5cy5kYXRhc3RvcmVfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bixcbiAgZGF0YXN0b3JlSW5kZXhTY2FuUmFuZ2VCc2F0bjogc3lzLmRhdGFzdG9yZV9pbmRleF9zY2FuX3JhbmdlX2JzYXRuLFxuICBkYXRhc3RvcmVEZWxldGVCeUluZGV4U2NhblBvaW50QnNhdG46IHN5cy5kYXRhc3RvcmVfZGVsZXRlX2J5X2luZGV4X3NjYW5fcG9pbnRfYnNhdG4sXG4gIGRhdGFzdG9yZURlbGV0ZUJ5SW5kZXhTY2FuUmFuZ2VCc2F0bjogc3lzLmRhdGFzdG9yZV9kZWxldGVfYnlfaW5kZXhfc2Nhbl9yYW5nZV9ic2F0bixcbiAgZGF0YXN0b3JlVXBkYXRlQnNhdG46IHN5cy5kYXRhc3RvcmVfdXBkYXRlX2JzYXRuLFxuICBkYXRhc3RvcmVDbGVhcjogc3lzLmRhdGFzdG9yZV9jbGVhcixcbiAgcm93SXRlckJzYXRuQWR2YW5jZTogc3lzLnJvd19pdGVyX2JzYXRuX2FkdmFuY2UsXG4gIHJvd0l0ZXJCc2F0bkNsb3NlOiBzeXMucm93X2l0ZXJfYnNhdG5fY2xvc2UsXG4gIHByb2NlZHVyZVN0YXJ0TXV0VHg6IHN5cy5wcm9jZWR1cmVfc3RhcnRfbXV0X3R4LFxuICBwcm9jZWR1cmVDb21taXRNdXRUeDogc3lzLnByb2NlZHVyZV9jb21taXRfbXV0X3R4LFxuICBwcm9jZWR1cmVBYm9ydE11dFR4OiBzeXMucHJvY2VkdXJlX2Fib3J0X211dF90eCxcbiAgcHJvY2VkdXJlSHR0cFJlcXVlc3Q6IHN5cy5wcm9jZWR1cmVfaHR0cF9yZXF1ZXN0XG59O1xuXG4vLyBzcmMvc2VydmVyL3J1bnRpbWUudHNcbnZhciB7IGZyZWV6ZSB9ID0gT2JqZWN0O1xudmFyIHN5czIgPSB7IC4uLl9zeXNjYWxsczJfMCwgLi4uX3N5c2NhbGxzMl8xIH07XG5mdW5jdGlvbiBpc0RhdGFzdG9yZUJhY2tlbmQodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiBcInRhYmxlSWRGcm9tTmFtZVwiIGluIHZhbHVlICYmIFwicHJvY2VkdXJlU3RhcnRNdXRUeFwiIGluIHZhbHVlO1xufVxuZnVuY3Rpb24gcmVxdWVzdEZyb21XaXJlKHJlcXVlc3QsIGJvZHkpIHtcbiAgcmV0dXJuIFJlcXVlc3RbbWFrZVJlcXVlc3RdKGJvZHksIHtcbiAgICBoZWFkZXJzOiBkZXNlcmlhbGl6ZUhlYWRlcnMocmVxdWVzdC5oZWFkZXJzKSxcbiAgICBtZXRob2Q6IGRlc2VyaWFsaXplTWV0aG9kKHJlcXVlc3QubWV0aG9kKSxcbiAgICB1cmk6IHJlcXVlc3QudXJpLFxuICAgIHZlcnNpb246IHJlcXVlc3QudmVyc2lvblxuICB9KTtcbn1cbmZ1bmN0aW9uIHJlc3BvbnNlSW50b1dpcmUocmVzcG9uc2UpIHtcbiAgcmV0dXJuIFtcbiAgICB7XG4gICAgICBoZWFkZXJzOiBzZXJpYWxpemVIZWFkZXJzKHJlc3BvbnNlLmhlYWRlcnMpLFxuICAgICAgdmVyc2lvbjogcmVzcG9uc2UudmVyc2lvbixcbiAgICAgIGNvZGU6IHJlc3BvbnNlLnN0YXR1c1xuICAgIH0sXG4gICAgcmVzcG9uc2UuYnl0ZXMoKVxuICBdO1xufVxuZnVuY3Rpb24gcGFyc2VKc29uT2JqZWN0KGpzb24pIHtcbiAgbGV0IHZhbHVlO1xuICB0cnkge1xuICAgIHZhbHVlID0gSlNPTi5wYXJzZShqc29uKTtcbiAgfSBjYXRjaCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBKU09OOiBmYWlsZWQgdG8gcGFyc2Ugc3RyaW5nXCIpO1xuICB9XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIgfHwgQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBhIEpTT04gb2JqZWN0IGF0IHRoZSB0b3AgbGV2ZWxcIik7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxudmFyIEp3dENsYWltc0ltcGwgPSBjbGFzcyB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IEp3dENsYWltcyBpbnN0YW5jZS5cbiAgICogQHBhcmFtIHJhd1BheWxvYWQgVGhlIEpXVCBwYXlsb2FkIGFzIGEgcmF3IEpTT04gc3RyaW5nLlxuICAgKiBAcGFyYW0gaWRlbnRpdHkgVGhlIGlkZW50aXR5IGZvciB0aGlzIEpXVC4gV2UgYXJlIG9ubHkgdGFraW5nIHRoaXMgYmVjYXVzZSB3ZSBkb24ndCBoYXZlIGEgYmxha2UzIGltcGxlbWVudGF0aW9uICh3aGljaCB3ZSBuZWVkIHRvIGNvbXB1dGUgaXQpLlxuICAgKi9cbiAgY29uc3RydWN0b3IocmF3UGF5bG9hZCwgaWRlbnRpdHkpIHtcbiAgICB0aGlzLnJhd1BheWxvYWQgPSByYXdQYXlsb2FkO1xuICAgIHRoaXMuZnVsbFBheWxvYWQgPSBwYXJzZUpzb25PYmplY3QocmF3UGF5bG9hZCk7XG4gICAgdGhpcy5faWRlbnRpdHkgPSBpZGVudGl0eTtcbiAgfVxuICBmdWxsUGF5bG9hZDtcbiAgX2lkZW50aXR5O1xuICBnZXQgaWRlbnRpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lkZW50aXR5O1xuICB9XG4gIGdldCBzdWJqZWN0KCkge1xuICAgIHJldHVybiB0aGlzLmZ1bGxQYXlsb2FkW1wic3ViXCJdO1xuICB9XG4gIGdldCBpc3N1ZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuZnVsbFBheWxvYWRbXCJpc3NcIl07XG4gIH1cbiAgZ2V0IGF1ZGllbmNlKCkge1xuICAgIGNvbnN0IGF1ZCA9IHRoaXMuZnVsbFBheWxvYWRbXCJhdWRcIl07XG4gICAgaWYgKGF1ZCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiB0eXBlb2YgYXVkID09PSBcInN0cmluZ1wiID8gW2F1ZF0gOiBhdWQ7XG4gIH1cbn07XG52YXIgQXV0aEN0eEltcGwgPSBjbGFzcyBfQXV0aEN0eEltcGwge1xuICBpc0ludGVybmFsO1xuICAvLyBTb3VyY2Ugb2YgdGhlIEpXVCBwYXlsb2FkIHN0cmluZywgaWYgdGhlcmUgaXMgb25lLlxuICBfand0U291cmNlO1xuICAvLyBXaGV0aGVyIHdlIGhhdmUgaW5pdGlhbGl6ZWQgdGhlIEpXVCBjbGFpbXMuXG4gIF9pbml0aWFsaXplZEpXVCA9IGZhbHNlO1xuICBfand0Q2xhaW1zO1xuICBfc2VuZGVySWRlbnRpdHk7XG4gIGNvbnN0cnVjdG9yKG9wdHMpIHtcbiAgICB0aGlzLmlzSW50ZXJuYWwgPSBvcHRzLmlzSW50ZXJuYWw7XG4gICAgdGhpcy5fand0U291cmNlID0gb3B0cy5qd3RTb3VyY2U7XG4gICAgdGhpcy5fc2VuZGVySWRlbnRpdHkgPSBvcHRzLnNlbmRlcklkZW50aXR5O1xuICB9XG4gIF9pbml0aWFsaXplSldUKCkge1xuICAgIGlmICh0aGlzLl9pbml0aWFsaXplZEpXVCkgcmV0dXJuO1xuICAgIHRoaXMuX2luaXRpYWxpemVkSldUID0gdHJ1ZTtcbiAgICBjb25zdCB0b2tlbiA9IHRoaXMuX2p3dFNvdXJjZSgpO1xuICAgIGlmICghdG9rZW4pIHtcbiAgICAgIHRoaXMuX2p3dENsYWltcyA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2p3dENsYWltcyA9IG5ldyBKd3RDbGFpbXNJbXBsKHRva2VuLCB0aGlzLl9zZW5kZXJJZGVudGl0eSk7XG4gICAgfVxuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cbiAgLyoqIExhemlseSBjb21wdXRlIHdoZXRoZXIgYSBKV1QgZXhpc3RzIGFuZCBpcyBwYXJzZWFibGUuICovXG4gIGdldCBoYXNKV1QoKSB7XG4gICAgdGhpcy5faW5pdGlhbGl6ZUpXVCgpO1xuICAgIHJldHVybiB0aGlzLl9qd3RDbGFpbXMgIT09IG51bGw7XG4gIH1cbiAgLyoqIExhemlseSBwYXJzZSB0aGUgSnd0Q2xhaW1zIG9ubHkgd2hlbiBhY2Nlc3NlZC4gKi9cbiAgZ2V0IGp3dCgpIHtcbiAgICB0aGlzLl9pbml0aWFsaXplSldUKCk7XG4gICAgcmV0dXJuIHRoaXMuX2p3dENsYWltcztcbiAgfVxuICAvKiogQ3JlYXRlIGEgY29udGV4dCByZXByZXNlbnRpbmcgaW50ZXJuYWwgKG5vbi11c2VyKSByZXF1ZXN0cy4gKi9cbiAgc3RhdGljIGludGVybmFsKCkge1xuICAgIHJldHVybiBuZXcgX0F1dGhDdHhJbXBsKHtcbiAgICAgIGlzSW50ZXJuYWw6IHRydWUsXG4gICAgICBqd3RTb3VyY2U6ICgpID0+IG51bGwsXG4gICAgICBzZW5kZXJJZGVudGl0eTogSWRlbnRpdHkuemVybygpXG4gICAgfSk7XG4gIH1cbiAgLyoqIElmIHRoZXJlIGlzIGEgY29ubmVjdGlvbiBpZCwgbG9vayB1cCB0aGUgSldUIHBheWxvYWQgZnJvbSB0aGUgc3lzdGVtIHRhYmxlcy4gKi9cbiAgc3RhdGljIGZyb21CYWNrZW5kKGNvbm5lY3Rpb25JZCwgc2VuZGVyLCBiYWNrZW5kKSB7XG4gICAgaWYgKGNvbm5lY3Rpb25JZCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG5ldyBfQXV0aEN0eEltcGwoe1xuICAgICAgICBpc0ludGVybmFsOiBmYWxzZSxcbiAgICAgICAgand0U291cmNlOiAoKSA9PiBudWxsLFxuICAgICAgICBzZW5kZXJJZGVudGl0eTogc2VuZGVyXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBfQXV0aEN0eEltcGwoe1xuICAgICAgaXNJbnRlcm5hbDogZmFsc2UsXG4gICAgICBqd3RTb3VyY2U6ICgpID0+IHtcbiAgICAgICAgY29uc3QgcGF5bG9hZEJ1ZiA9IGJhY2tlbmQuZ2V0Snd0UGF5bG9hZChcbiAgICAgICAgICBjb25uZWN0aW9uSWQuX19jb25uZWN0aW9uX2lkX19cbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHBheWxvYWRCdWYubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgcGF5bG9hZFN0ciA9IG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwYXlsb2FkQnVmKTtcbiAgICAgICAgcmV0dXJuIHBheWxvYWRTdHI7XG4gICAgICB9LFxuICAgICAgc2VuZGVySWRlbnRpdHk6IHNlbmRlclxuICAgIH0pO1xuICB9XG4gIC8qKiBJZiB0aGVyZSBpcyBhIGNvbm5lY3Rpb24gaWQsIGxvb2sgdXAgdGhlIEpXVCBwYXlsb2FkIGZyb20gdGhlIGhvc3Qgc3lzdGVtIHRhYmxlcy4gKi9cbiAgc3RhdGljIGZyb21TeXN0ZW1UYWJsZXMoY29ubmVjdGlvbklkLCBzZW5kZXIpIHtcbiAgICByZXR1cm4gX0F1dGhDdHhJbXBsLmZyb21CYWNrZW5kKGNvbm5lY3Rpb25JZCwgc2VuZGVyLCBob3N0QmFja2VuZCk7XG4gIH1cbn07XG52YXIgUmVkdWNlckN0eEltcGwgPSBjbGFzcyBSZWR1Y2VyQ3R4IHtcbiAgI2lkZW50aXR5O1xuICAjc2VuZGVyQXV0aDtcbiAgI3V1aWRDb3VudGVyO1xuICAjcmFuZG9tO1xuICAjYmFja2VuZDtcbiAgc2VuZGVyO1xuICB0aW1lc3RhbXA7XG4gIGNvbm5lY3Rpb25JZDtcbiAgZGI7XG4gIGVudiA9IGVudmlyb25tZW50O1xuICBhcztcbiAgY29uc3RydWN0b3Ioc2VuZGVyLCB0aW1lc3RhbXAsIGNvbm5lY3Rpb25JZCwgZGJWaWV3LCBiYWNrZW5kT3JBc1ZpZXdzID0gaG9zdEJhY2tlbmQsIHNlbmRlckF1dGgsIHJhbmRvbSwgYXNWaWV3cyA9IHt9KSB7XG4gICAgT2JqZWN0LnNlYWwodGhpcyk7XG4gICAgdGhpcy5zZW5kZXIgPSBzZW5kZXI7XG4gICAgdGhpcy50aW1lc3RhbXAgPSB0aW1lc3RhbXA7XG4gICAgdGhpcy5jb25uZWN0aW9uSWQgPSBjb25uZWN0aW9uSWQ7XG4gICAgdGhpcy5kYiA9IGRiVmlldztcbiAgICBpZiAoaXNEYXRhc3RvcmVCYWNrZW5kKGJhY2tlbmRPckFzVmlld3MpKSB7XG4gICAgICB0aGlzLiNiYWNrZW5kID0gYmFja2VuZE9yQXNWaWV3cztcbiAgICAgIHRoaXMuI3NlbmRlckF1dGggPSBzZW5kZXJBdXRoO1xuICAgICAgdGhpcy4jcmFuZG9tID0gcmFuZG9tO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLiNiYWNrZW5kID0gaG9zdEJhY2tlbmQ7XG4gICAgICBhc1ZpZXdzID0gYmFja2VuZE9yQXNWaWV3cztcbiAgICB9XG4gICAgdGhpcy5hcyA9IGFzVmlld3M7XG4gIH1cbiAgLyoqIFJlc2V0IHRoZSBgUmVkdWNlckN0eGAgdG8gYmUgdXNlZCBmb3IgYSBuZXcgdHJhbnNhY3Rpb24gKi9cbiAgc3RhdGljIHJlc2V0SG9zdChtZSwgc2VuZGVyLCB0aW1lc3RhbXAsIGNvbm5lY3Rpb25JZCwgZGJWaWV3LCBhc1ZpZXdzKSB7XG4gICAgbWUuc2VuZGVyID0gc2VuZGVyO1xuICAgIG1lLnRpbWVzdGFtcCA9IHRpbWVzdGFtcDtcbiAgICBtZS5jb25uZWN0aW9uSWQgPSBjb25uZWN0aW9uSWQ7XG4gICAgbWUuI2JhY2tlbmQgPSBob3N0QmFja2VuZDtcbiAgICBtZS4jc2VuZGVyQXV0aCA9IHZvaWQgMDtcbiAgICBtZS4jcmFuZG9tID0gdm9pZCAwO1xuICAgIG1lLiN1dWlkQ291bnRlciA9IHZvaWQgMDtcbiAgICBpZiAoZGJWaWV3ICE9PSB2b2lkIDApIHtcbiAgICAgIG1lLmRiID0gZGJWaWV3O1xuICAgIH1cbiAgICBpZiAoYXNWaWV3cyAhPT0gdm9pZCAwKSB7XG4gICAgICBtZS5hcyA9IGFzVmlld3M7XG4gICAgfVxuICB9XG4gIC8qKiBSZXNldCB0aGUgYFJlZHVjZXJDdHhgIHRvIGJlIHVzZWQgd2l0aCBhbiBpbmplY3RhYmxlIGJhY2tlbmQuICovXG4gIHN0YXRpYyByZXNldChtZSwgc2VuZGVyLCB0aW1lc3RhbXAsIGNvbm5lY3Rpb25JZCwgYmFja2VuZE9yRGJWaWV3ID0gaG9zdEJhY2tlbmQsIHNlbmRlckF1dGgsIHJhbmRvbSwgZGJWaWV3LCBhc1ZpZXdzKSB7XG4gICAgbWUuc2VuZGVyID0gc2VuZGVyO1xuICAgIG1lLnRpbWVzdGFtcCA9IHRpbWVzdGFtcDtcbiAgICBtZS5jb25uZWN0aW9uSWQgPSBjb25uZWN0aW9uSWQ7XG4gICAgaWYgKGlzRGF0YXN0b3JlQmFja2VuZChiYWNrZW5kT3JEYlZpZXcpKSB7XG4gICAgICBtZS4jYmFja2VuZCA9IGJhY2tlbmRPckRiVmlldztcbiAgICAgIG1lLiNzZW5kZXJBdXRoID0gc2VuZGVyQXV0aDtcbiAgICAgIG1lLiNyYW5kb20gPSByYW5kb207XG4gICAgfSBlbHNlIHtcbiAgICAgIG1lLiNiYWNrZW5kID0gaG9zdEJhY2tlbmQ7XG4gICAgICBtZS4jc2VuZGVyQXV0aCA9IHZvaWQgMDtcbiAgICAgIG1lLiNyYW5kb20gPSB2b2lkIDA7XG4gICAgICBkYlZpZXcgPSBiYWNrZW5kT3JEYlZpZXc7XG4gICAgICBhc1ZpZXdzID0gc2VuZGVyQXV0aDtcbiAgICB9XG4gICAgbWUuI3V1aWRDb3VudGVyID0gdm9pZCAwO1xuICAgIGlmIChkYlZpZXcgIT09IHZvaWQgMCkge1xuICAgICAgbWUuZGIgPSBkYlZpZXc7XG4gICAgfVxuICAgIGlmIChhc1ZpZXdzICE9PSB2b2lkIDApIHtcbiAgICAgIG1lLmFzID0gYXNWaWV3cztcbiAgICB9XG4gIH1cbiAgZ2V0IGRhdGFiYXNlSWRlbnRpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2lkZW50aXR5ID8/PSBuZXcgSWRlbnRpdHkodGhpcy4jYmFja2VuZC5pZGVudGl0eSgpKTtcbiAgfVxuICBnZXQgaWRlbnRpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YWJhc2VJZGVudGl0eTtcbiAgfVxuICBnZXQgc2VuZGVyQXV0aCgpIHtcbiAgICByZXR1cm4gdGhpcy4jc2VuZGVyQXV0aCA/Pz0gQXV0aEN0eEltcGwuZnJvbUJhY2tlbmQoXG4gICAgICB0aGlzLmNvbm5lY3Rpb25JZCxcbiAgICAgIHRoaXMuc2VuZGVyLFxuICAgICAgdGhpcy4jYmFja2VuZFxuICAgICk7XG4gIH1cbiAgZ2V0IHJhbmRvbSgpIHtcbiAgICByZXR1cm4gdGhpcy4jcmFuZG9tID8/PSBtYWtlUmFuZG9tKHRoaXMudGltZXN0YW1wKTtcbiAgfVxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IHJhbmRvbSB7QGxpbmsgVXVpZH0gYHY0YCB1c2luZyB0aGlzIGBSZWR1Y2VyQ3R4YCdzIFJORy5cbiAgICovXG4gIG5ld1V1aWRWNCgpIHtcbiAgICBjb25zdCBieXRlcyA9IHRoaXMucmFuZG9tLmZpbGwobmV3IFVpbnQ4QXJyYXkoMTYpKTtcbiAgICByZXR1cm4gVXVpZC5mcm9tUmFuZG9tQnl0ZXNWNChieXRlcyk7XG4gIH1cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBzb3J0YWJsZSB7QGxpbmsgVXVpZH0gYHY3YCB1c2luZyB0aGlzIGBSZWR1Y2VyQ3R4YCdzIFJORywgY291bnRlcixcbiAgICogYW5kIHRpbWVzdGFtcC5cbiAgICovXG4gIG5ld1V1aWRWNygpIHtcbiAgICBjb25zdCBieXRlcyA9IHRoaXMucmFuZG9tLmZpbGwobmV3IFVpbnQ4QXJyYXkoNCkpO1xuICAgIGNvbnN0IGNvdW50ZXIgPSB0aGlzLiN1dWlkQ291bnRlciA/Pz0geyB2YWx1ZTogMCB9O1xuICAgIHJldHVybiBVdWlkLmZyb21Db3VudGVyVjcoY291bnRlciwgdGhpcy50aW1lc3RhbXAsIGJ5dGVzKTtcbiAgfVxufTtcbnZhciBjYWxsVXNlckZ1bmN0aW9uID0gZnVuY3Rpb24gX19zcGFjZXRpbWVkYl9lbmRfc2hvcnRfYmFja3RyYWNlKGZuLCAuLi5hcmdzKSB7XG4gIHJldHVybiBmbiguLi5hcmdzKTtcbn07XG5mdW5jdGlvbiBydW5XaXRoVHgobWFrZUN0eCwgYm9keSwgYmFja2VuZCA9IGhvc3RCYWNrZW5kKSB7XG4gIGNvbnN0IHJ1biA9ICgpID0+IHtcbiAgICBjb25zdCB0aW1lc3RhbXAgPSBiYWNrZW5kLnByb2NlZHVyZVN0YXJ0TXV0VHgoKTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGJvZHkobWFrZUN0eChuZXcgVGltZXN0YW1wKHRpbWVzdGFtcCkpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBiYWNrZW5kLnByb2NlZHVyZUFib3J0TXV0VHgoKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9O1xuICBsZXQgcmVzID0gcnVuKCk7XG4gIHRyeSB7XG4gICAgYmFja2VuZC5wcm9jZWR1cmVDb21taXRNdXRUeCgpO1xuICAgIHJldHVybiByZXM7XG4gIH0gY2F0Y2gge1xuICB9XG4gIGNvbnNvbGUud2FybihcImNvbW1pdHRpbmcgYW5vbnltb3VzIHRyYW5zYWN0aW9uIGZhaWxlZFwiKTtcbiAgcmVzID0gcnVuKCk7XG4gIHRyeSB7XG4gICAgYmFja2VuZC5wcm9jZWR1cmVDb21taXRNdXRUeCgpO1xuICAgIHJldHVybiByZXM7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0cmFuc2FjdGlvbiByZXRyeSBmYWlsZWQgYWdhaW5cIiwgeyBjYXVzZTogZSB9KTtcbiAgfVxufVxuZnVuY3Rpb24gZmxhdHRlblN1Ym1vZHVsZURpc3BhdGNoZXMoZGlzcGF0Y2hlcywgcGFyZW50UHJlZml4ID0gXCJcIikge1xuICBjb25zdCByZXN1bHQgPSBbXTtcbiAgZm9yIChjb25zdCBkIG9mIGRpc3BhdGNoZXMpIHtcbiAgICBjb25zdCBuYW1lUHJlZml4ID0gcGFyZW50UHJlZml4ICsgZC5uYW1lc3BhY2UgKyBcIi5cIjtcbiAgICByZXN1bHQucHVzaCh7XG4gICAgICByZWR1Y2VyRm5zOiBkLnJlZHVjZXJGbnMsXG4gICAgICByZWR1Y2VyRGVmczogZC5yZWR1Y2VyRGVmcyxcbiAgICAgIHByb2NlZHVyZUZuczogZC5wcm9jZWR1cmVGbnMsXG4gICAgICBwcm9jZWR1cmVEZWZzOiBkLnByb2NlZHVyZURlZnMsXG4gICAgICBhbm9uVmlld0ZuczogZC5hbm9uVmlld0ZucyxcbiAgICAgIHZpZXdGbnM6IGQudmlld0ZucyxcbiAgICAgIHRhYmxlczogZC50YWJsZXMsXG4gICAgICBzY2hlbWFUYWJsZXM6IGQuc2NoZW1hVGFibGVzLFxuICAgICAgdHlwZXNwYWNlOiBkLnR5cGVzcGFjZSxcbiAgICAgIGRiVmlld186IHZvaWQgMCxcbiAgICAgIHF1ZXJ5QnVpbGRlcl86IHZvaWQgMCxcbiAgICAgIG5hbWVQcmVmaXgsXG4gICAgICBzdWJEaXNwYXRjaGVzOiBkLnN1YkRpc3BhdGNoZXNcbiAgICB9KTtcbiAgICByZXN1bHQucHVzaCguLi5mbGF0dGVuU3VibW9kdWxlRGlzcGF0Y2hlcyhkLnN1YkRpc3BhdGNoZXMsIG5hbWVQcmVmaXgpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxudmFyIG1ha2VIb29rcyA9IChzY2hlbWEyKSA9PiBuZXcgTW9kdWxlSG9va3NJbXBsKHNjaGVtYTIpO1xudmFyIE1vZHVsZUhvb2tzSW1wbCA9IGNsYXNzIHtcbiAgI3NjaGVtYTtcbiAgI2RiVmlld187XG4gICNjb25zdW1lckFzXztcbiAgI3JlZHVjZXJBcmdzRGVzZXJpYWxpemVycztcbiAgI2NvbnN1bWVyUmVkdWNlckNvdW50O1xuICAjY29uc3VtZXJQcm9jZWR1cmVDb3VudDtcbiAgI2ZsYXRTdWJtb2R1bGVzO1xuICAjY29uc3VtZXJBbm9uVmlld0NvdW50O1xuICAjY29uc3VtZXJWaWV3Q291bnQ7XG4gIC8qKiBDYWNoZSB0aGUgYFJlZHVjZXJDdHhgIG9iamVjdCB0byBhdm9pZCBhbGxvY2F0aW5nIGFuZXcgZm9yIGV2ZXJ5IHJlZHVjZXIgY2FsbC4gKi9cbiAgI3JlZHVjZXJDdHhfO1xuICAvKiogUGVyLXN1Ym1vZHVsZSBhbGlhcyBjdHggbWFwcywgY2FjaGVkIGxhemlseSAocGFyYWxsZWwgdG8gI2ZsYXRTdWJtb2R1bGVzKS4gKi9cbiAgI3N1Ym1vZHVsZUFzVmlld3NfID0gW107XG4gIGNvbnN0cnVjdG9yKHNjaGVtYTIpIHtcbiAgICB0aGlzLiNzY2hlbWEgPSBzY2hlbWEyO1xuICAgIHRoaXMuI2NvbnN1bWVyUmVkdWNlckNvdW50ID0gc2NoZW1hMi5yZWR1Y2Vycy5sZW5ndGg7XG4gICAgdGhpcy4jY29uc3VtZXJQcm9jZWR1cmVDb3VudCA9IHNjaGVtYTIucHJvY2VkdXJlcy5sZW5ndGg7XG4gICAgdGhpcy4jY29uc3VtZXJBbm9uVmlld0NvdW50ID0gc2NoZW1hMi5hbm9uVmlld3MubGVuZ3RoO1xuICAgIHRoaXMuI2NvbnN1bWVyVmlld0NvdW50ID0gc2NoZW1hMi52aWV3cy5sZW5ndGg7XG4gICAgdGhpcy4jZmxhdFN1Ym1vZHVsZXMgPSBmbGF0dGVuU3VibW9kdWxlRGlzcGF0Y2hlcyhcbiAgICAgIHNjaGVtYTIuc3VibW9kdWxlRGlzcGF0Y2hJbmZvc1xuICAgICk7XG4gICAgY29uc3QgY29uc3VtZXJEZXNlcmlhbGl6ZXJzID0gc2NoZW1hMi5tb2R1bGVEZWYucmVkdWNlcnMubWFwKFxuICAgICAgKHsgcGFyYW1zIH0pID0+IFByb2R1Y3RUeXBlLm1ha2VEZXNlcmlhbGl6ZXIocGFyYW1zLCBzY2hlbWEyLnR5cGVzcGFjZSlcbiAgICApO1xuICAgIGNvbnN0IHN1Ym1vZHVsZURlc2VyaWFsaXplcnMgPSB0aGlzLiNmbGF0U3VibW9kdWxlcy5mbGF0TWFwKFxuICAgICAgKHsgcmVkdWNlckRlZnMsIHR5cGVzcGFjZSB9KSA9PiByZWR1Y2VyRGVmcy5tYXAoXG4gICAgICAgICh7IHBhcmFtcyB9KSA9PiBQcm9kdWN0VHlwZS5tYWtlRGVzZXJpYWxpemVyKHBhcmFtcywgdHlwZXNwYWNlKVxuICAgICAgKVxuICAgICk7XG4gICAgdGhpcy4jcmVkdWNlckFyZ3NEZXNlcmlhbGl6ZXJzID0gW1xuICAgICAgLi4uY29uc3VtZXJEZXNlcmlhbGl6ZXJzLFxuICAgICAgLi4uc3VibW9kdWxlRGVzZXJpYWxpemVyc1xuICAgIF07XG4gIH1cbiAgZ2V0ICNkYlZpZXcoKSB7XG4gICAgaWYgKHRoaXMuI2RiVmlld18gIT09IHZvaWQgMCkgcmV0dXJuIHRoaXMuI2RiVmlld187XG4gICAgY29uc3Qgcm9vdFRhYmxlcyA9IE9iamVjdC52YWx1ZXModGhpcy4jc2NoZW1hLnNjaGVtYVR5cGUudGFibGVzKS5tYXAoXG4gICAgICAodGFibGUyKSA9PiBbXG4gICAgICAgIHRhYmxlMi5hY2Nlc3Nvck5hbWUsXG4gICAgICAgIG1ha2VUYWJsZVZpZXcodGhpcy4jc2NoZW1hLnR5cGVzcGFjZSwgdGFibGUyLnRhYmxlRGVmKVxuICAgICAgXVxuICAgICk7XG4gICAgY29uc3Qgc3VibW9kdWxlTnMgPSB0aGlzLiNzY2hlbWEuc3VibW9kdWxlRGlzcGF0Y2hJbmZvcy5tYXAoKGRpc3BhdGNoKSA9PiBbXG4gICAgICBkaXNwYXRjaC5uYW1lc3BhY2UsXG4gICAgICBidWlsZERiVmlld0ZvckRpc3BhdGNoKGRpc3BhdGNoLCBkaXNwYXRjaC5uYW1lc3BhY2UgKyBcIi5cIilcbiAgICBdKTtcbiAgICB0aGlzLiNkYlZpZXdfID0gZnJlZXplKFxuICAgICAgT2JqZWN0LmZyb21FbnRyaWVzKFsuLi5yb290VGFibGVzLCAuLi5zdWJtb2R1bGVOc10pXG4gICAgKTtcbiAgICByZXR1cm4gdGhpcy4jZGJWaWV3XztcbiAgfVxuICAjZ2V0U3VibW9kdWxlRGJWaWV3KHN1Ym1vZHVsZUlkeCkge1xuICAgIGNvbnN0IG0gPSB0aGlzLiNmbGF0U3VibW9kdWxlc1tzdWJtb2R1bGVJZHhdO1xuICAgIHJldHVybiBtLmRiVmlld18gPz89IGZyZWV6ZShcbiAgICAgIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgbS50YWJsZXMubWFwKCh7IGFjY2Vzc29yTmFtZSwgdGFibGVEZWYgfSkgPT4gW1xuICAgICAgICAgIGFjY2Vzc29yTmFtZSxcbiAgICAgICAgICBtYWtlVGFibGVWaWV3KG0udHlwZXNwYWNlLCB0YWJsZURlZiwgbS5uYW1lUHJlZml4KVxuICAgICAgICBdKVxuICAgICAgKVxuICAgICk7XG4gIH1cbiAgI2dldFN1Ym1vZHVsZUFzVmlld3Moc3VibW9kdWxlSWR4KSB7XG4gICAgcmV0dXJuIHRoaXMuI3N1Ym1vZHVsZUFzVmlld3NfW3N1Ym1vZHVsZUlkeF0gPz89IGJ1aWxkQWxpYXNDdHhNYXAoXG4gICAgICB0aGlzLiNyZWR1Y2VyQ3R4LFxuICAgICAgdGhpcy4jZmxhdFN1Ym1vZHVsZXNbc3VibW9kdWxlSWR4XS5zdWJEaXNwYXRjaGVzLFxuICAgICAgdGhpcy4jZmxhdFN1Ym1vZHVsZXNbc3VibW9kdWxlSWR4XS5uYW1lUHJlZml4XG4gICAgKTtcbiAgfVxuICAvKiogUXVlcnkgYnVpbGRlciBzY29wZWQgdG8gdGhlIHN1Ym1vZHVsZSdzIG93biB0YWJsZXMsIHdpdGggbmFtZXNwYWNlLXByZWZpeGVkXG4gICAqICBzb3VyY2UgbmFtZXMgc28gZ2VuZXJhdGVkIFNRTCB0YXJnZXRzIHRoZSBtb3VudGVkIHRhYmxlIG5hbWVzLiAqL1xuICAjZ2V0U3VibW9kdWxlUXVlcnlCdWlsZGVyKHN1Ym1vZHVsZUlkeCkge1xuICAgIGNvbnN0IG0gPSB0aGlzLiNmbGF0U3VibW9kdWxlc1tzdWJtb2R1bGVJZHhdO1xuICAgIHJldHVybiBtLnF1ZXJ5QnVpbGRlcl8gPz89IG1ha2VRdWVyeUJ1aWxkZXIoe1xuICAgICAgdGFibGVzOiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKG0uc2NoZW1hVGFibGVzKS5tYXAoKFtrZXksIGRlZl0pID0+IFtcbiAgICAgICAgICBrZXksXG4gICAgICAgICAgeyAuLi5kZWYsIHNvdXJjZU5hbWU6IG0ubmFtZVByZWZpeCArIGRlZi5zb3VyY2VOYW1lIH1cbiAgICAgICAgXSlcbiAgICAgIClcbiAgICB9KTtcbiAgfVxuICBnZXQgI3JlZHVjZXJDdHgoKSB7XG4gICAgcmV0dXJuIHRoaXMuI3JlZHVjZXJDdHhfID8/PSBuZXcgUmVkdWNlckN0eEltcGwoXG4gICAgICBJZGVudGl0eS56ZXJvKCksXG4gICAgICBUaW1lc3RhbXAuVU5JWF9FUE9DSCxcbiAgICAgIG51bGwsXG4gICAgICB0aGlzLiNkYlZpZXdcbiAgICApO1xuICB9XG4gIGdldCAjY29uc3VtZXJBcygpIHtcbiAgICByZXR1cm4gdGhpcy4jY29uc3VtZXJBc18gPz89IGJ1aWxkQWxpYXNDdHhNYXAoXG4gICAgICB0aGlzLiNyZWR1Y2VyQ3R4LFxuICAgICAgdGhpcy4jc2NoZW1hLnN1Ym1vZHVsZURpc3BhdGNoSW5mb3MsXG4gICAgICBcIlwiXG4gICAgKTtcbiAgfVxuICBfX2Rlc2NyaWJlX21vZHVsZV9fKCkge1xuICAgIGNvbnN0IHdyaXRlciA9IG5ldyBCaW5hcnlXcml0ZXIoMTI4KTtcbiAgICBSYXdNb2R1bGVEZWYuc2VyaWFsaXplKFxuICAgICAgd3JpdGVyLFxuICAgICAgUmF3TW9kdWxlRGVmLlYxMCh0aGlzLiNzY2hlbWEucmF3TW9kdWxlRGVmVjEwKCkpXG4gICAgKTtcbiAgICByZXR1cm4gd3JpdGVyLmdldEJ1ZmZlcigpO1xuICB9XG4gIF9fZ2V0X2Vycm9yX2NvbnN0cnVjdG9yX18oY29kZSkge1xuICAgIHJldHVybiBnZXRFcnJvckNvbnN0cnVjdG9yKGNvZGUpO1xuICB9XG4gIGdldCBfX3NlbmRlcl9lcnJvcl9jbGFzc19fKCkge1xuICAgIHJldHVybiBTZW5kZXJFcnJvcjtcbiAgfVxuICBfX2NhbGxfcmVkdWNlcl9fKHJlZHVjZXJJZCwgc2VuZGVyLCBjb25uSWQsIHRpbWVzdGFtcCwgYXJnc0J1Zikge1xuICAgIGNvbnN0IGRlc2VyaWFsaXplQXJncyA9IHRoaXMuI3JlZHVjZXJBcmdzRGVzZXJpYWxpemVyc1tyZWR1Y2VySWRdO1xuICAgIEJJTkFSWV9SRUFERVIucmVzZXQoYXJnc0J1Zik7XG4gICAgY29uc3QgYXJncyA9IGRlc2VyaWFsaXplQXJncyhCSU5BUllfUkVBREVSKTtcbiAgICBjb25zdCBzZW5kZXJJZGVudGl0eSA9IG5ldyBJZGVudGl0eShzZW5kZXIpO1xuICAgIGxldCBmbjtcbiAgICBsZXQgZGJWaWV3O1xuICAgIGxldCBhc1ZpZXdzO1xuICAgIGlmIChyZWR1Y2VySWQgPCB0aGlzLiNjb25zdW1lclJlZHVjZXJDb3VudCkge1xuICAgICAgZm4gPSB0aGlzLiNzY2hlbWEucmVkdWNlcnNbcmVkdWNlcklkXTtcbiAgICAgIGRiVmlldyA9IHRoaXMuI2RiVmlldztcbiAgICAgIGFzVmlld3MgPSB0aGlzLiNjb25zdW1lckFzO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgb2Zmc2V0ID0gdGhpcy4jY29uc3VtZXJSZWR1Y2VyQ291bnQ7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuI2ZsYXRTdWJtb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLiNmbGF0U3VibW9kdWxlc1tpXTtcbiAgICAgICAgaWYgKHJlZHVjZXJJZCA8IG9mZnNldCArIG0ucmVkdWNlckZucy5sZW5ndGgpIHtcbiAgICAgICAgICBmbiA9IG0ucmVkdWNlckZuc1tyZWR1Y2VySWQgLSBvZmZzZXRdO1xuICAgICAgICAgIGRiVmlldyA9IHRoaXMuI2dldFN1Ym1vZHVsZURiVmlldyhpKTtcbiAgICAgICAgICBhc1ZpZXdzID0gdGhpcy4jZ2V0U3VibW9kdWxlQXNWaWV3cyhpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBvZmZzZXQgKz0gbS5yZWR1Y2VyRm5zLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIGlmIChmbiA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGB1bmtub3duIHJlZHVjZXJJZCAke3JlZHVjZXJJZH1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgY3R4ID0gdGhpcy4jcmVkdWNlckN0eDtcbiAgICBSZWR1Y2VyQ3R4SW1wbC5yZXNldEhvc3QoXG4gICAgICBjdHgsXG4gICAgICBzZW5kZXJJZGVudGl0eSxcbiAgICAgIG5ldyBUaW1lc3RhbXAodGltZXN0YW1wKSxcbiAgICAgIENvbm5lY3Rpb25JZC5udWxsSWZaZXJvKG5ldyBDb25uZWN0aW9uSWQoY29ubklkKSksXG4gICAgICBkYlZpZXcsXG4gICAgICBhc1ZpZXdzXG4gICAgKTtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKGZuLCBjdHgsIGFyZ3MpO1xuICB9XG4gIF9fY2FsbF92aWV3X18oaWQsIHNlbmRlciwgYXJnc0J1Zikge1xuICAgIGNvbnN0IG1vZHVsZUN0eCA9IHRoaXMuI3NjaGVtYTtcbiAgICBsZXQgdmlld0ZucztcbiAgICBsZXQgbG9jYWxJZDtcbiAgICBsZXQgZGJWaWV3O1xuICAgIGxldCBmcm9tO1xuICAgIGlmIChpZCA8IHRoaXMuI2NvbnN1bWVyVmlld0NvdW50KSB7XG4gICAgICB2aWV3Rm5zID0gbW9kdWxlQ3R4LnZpZXdzO1xuICAgICAgbG9jYWxJZCA9IGlkO1xuICAgICAgZGJWaWV3ID0gdGhpcy4jZGJWaWV3O1xuICAgICAgZnJvbSA9IG1ha2VRdWVyeUJ1aWxkZXIobW9kdWxlQ3R4LnNjaGVtYVR5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgb2Zmc2V0ID0gdGhpcy4jY29uc3VtZXJWaWV3Q291bnQ7XG4gICAgICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy4jZmxhdFN1Ym1vZHVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgbSA9IHRoaXMuI2ZsYXRTdWJtb2R1bGVzW2ldO1xuICAgICAgICBpZiAoaWQgPCBvZmZzZXQgKyBtLnZpZXdGbnMubGVuZ3RoKSB7XG4gICAgICAgICAgdmlld0ZucyA9IG0udmlld0ZucztcbiAgICAgICAgICBsb2NhbElkID0gaWQgLSBvZmZzZXQ7XG4gICAgICAgICAgZGJWaWV3ID0gdGhpcy4jZ2V0U3VibW9kdWxlRGJWaWV3KGkpO1xuICAgICAgICAgIGZyb20gPSB0aGlzLiNnZXRTdWJtb2R1bGVRdWVyeUJ1aWxkZXIoaSk7XG4gICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG9mZnNldCArPSBtLnZpZXdGbnMubGVuZ3RoO1xuICAgICAgfVxuICAgICAgaWYgKCFmb3VuZCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYHVua25vd24gdmlld0lkICR7aWR9YCk7XG4gICAgfVxuICAgIGNvbnN0IHsgZm4sIGRlc2VyaWFsaXplUGFyYW1zLCBzZXJpYWxpemVSZXR1cm4sIHJldHVyblR5cGVCYXNlU2l6ZSB9ID0gdmlld0Zuc1tsb2NhbElkXTtcbiAgICBjb25zdCBjdHggPSBmcmVlemUoe1xuICAgICAgZW52OiBlbnZpcm9ubWVudCxcbiAgICAgIHNlbmRlcjogbmV3IElkZW50aXR5KHNlbmRlciksXG4gICAgICBkYjogZGJWaWV3LFxuICAgICAgZnJvbVxuICAgIH0pO1xuICAgIGNvbnN0IGFyZ3MgPSBkZXNlcmlhbGl6ZVBhcmFtcyhuZXcgQmluYXJ5UmVhZGVyKGFyZ3NCdWYpKTtcbiAgICBjb25zdCByZXQgPSBjYWxsVXNlckZ1bmN0aW9uKGZuLCBjdHgsIGFyZ3MpO1xuICAgIGNvbnN0IHJldEJ1ZiA9IG5ldyBCaW5hcnlXcml0ZXIocmV0dXJuVHlwZUJhc2VTaXplKTtcbiAgICBpZiAoaXNSb3dUeXBlZFF1ZXJ5KHJldCkpIHtcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gdG9TcWwocmV0KTtcbiAgICAgIFZpZXdSZXN1bHRIZWFkZXIuc2VyaWFsaXplKHJldEJ1ZiwgVmlld1Jlc3VsdEhlYWRlci5SYXdTcWwocXVlcnkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgVmlld1Jlc3VsdEhlYWRlci5zZXJpYWxpemUocmV0QnVmLCBWaWV3UmVzdWx0SGVhZGVyLlJvd0RhdGEpO1xuICAgICAgc2VyaWFsaXplUmV0dXJuKHJldEJ1ZiwgcmV0KTtcbiAgICB9XG4gICAgcmV0dXJuIHsgZGF0YTogcmV0QnVmLmdldEJ1ZmZlcigpIH07XG4gIH1cbiAgX19jYWxsX3ZpZXdfYW5vbl9fKGlkLCBhcmdzQnVmKSB7XG4gICAgY29uc3QgbW9kdWxlQ3R4ID0gdGhpcy4jc2NoZW1hO1xuICAgIGxldCBhbm9uVmlld0ZucztcbiAgICBsZXQgbG9jYWxJZDtcbiAgICBsZXQgZGJWaWV3O1xuICAgIGxldCBmcm9tO1xuICAgIGlmIChpZCA8IHRoaXMuI2NvbnN1bWVyQW5vblZpZXdDb3VudCkge1xuICAgICAgYW5vblZpZXdGbnMgPSBtb2R1bGVDdHguYW5vblZpZXdzO1xuICAgICAgbG9jYWxJZCA9IGlkO1xuICAgICAgZGJWaWV3ID0gdGhpcy4jZGJWaWV3O1xuICAgICAgZnJvbSA9IG1ha2VRdWVyeUJ1aWxkZXIobW9kdWxlQ3R4LnNjaGVtYVR5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgb2Zmc2V0ID0gdGhpcy4jY29uc3VtZXJBbm9uVmlld0NvdW50O1xuICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuI2ZsYXRTdWJtb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLiNmbGF0U3VibW9kdWxlc1tpXTtcbiAgICAgICAgaWYgKGlkIDwgb2Zmc2V0ICsgbS5hbm9uVmlld0Zucy5sZW5ndGgpIHtcbiAgICAgICAgICBhbm9uVmlld0ZucyA9IG0uYW5vblZpZXdGbnM7XG4gICAgICAgICAgbG9jYWxJZCA9IGlkIC0gb2Zmc2V0O1xuICAgICAgICAgIGRiVmlldyA9IHRoaXMuI2dldFN1Ym1vZHVsZURiVmlldyhpKTtcbiAgICAgICAgICBmcm9tID0gdGhpcy4jZ2V0U3VibW9kdWxlUXVlcnlCdWlsZGVyKGkpO1xuICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBvZmZzZXQgKz0gbS5hbm9uVmlld0Zucy5sZW5ndGg7XG4gICAgICB9XG4gICAgICBpZiAoIWZvdW5kKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgdW5rbm93biBhbm9uVmlld0lkICR7aWR9YCk7XG4gICAgfVxuICAgIGNvbnN0IHsgZm4sIGRlc2VyaWFsaXplUGFyYW1zLCBzZXJpYWxpemVSZXR1cm4sIHJldHVyblR5cGVCYXNlU2l6ZSB9ID0gYW5vblZpZXdGbnNbbG9jYWxJZF07XG4gICAgY29uc3QgY3R4ID0gZnJlZXplKHtcbiAgICAgIGVudjogZW52aXJvbm1lbnQsXG4gICAgICBkYjogZGJWaWV3LFxuICAgICAgZnJvbVxuICAgIH0pO1xuICAgIGNvbnN0IGFyZ3MgPSBkZXNlcmlhbGl6ZVBhcmFtcyhuZXcgQmluYXJ5UmVhZGVyKGFyZ3NCdWYpKTtcbiAgICBjb25zdCByZXQgPSBjYWxsVXNlckZ1bmN0aW9uKGZuLCBjdHgsIGFyZ3MpO1xuICAgIGNvbnN0IHJldEJ1ZiA9IG5ldyBCaW5hcnlXcml0ZXIocmV0dXJuVHlwZUJhc2VTaXplKTtcbiAgICBpZiAoaXNSb3dUeXBlZFF1ZXJ5KHJldCkpIHtcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gdG9TcWwocmV0KTtcbiAgICAgIFZpZXdSZXN1bHRIZWFkZXIuc2VyaWFsaXplKHJldEJ1ZiwgVmlld1Jlc3VsdEhlYWRlci5SYXdTcWwocXVlcnkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgVmlld1Jlc3VsdEhlYWRlci5zZXJpYWxpemUocmV0QnVmLCBWaWV3UmVzdWx0SGVhZGVyLlJvd0RhdGEpO1xuICAgICAgc2VyaWFsaXplUmV0dXJuKHJldEJ1ZiwgcmV0KTtcbiAgICB9XG4gICAgcmV0dXJuIHsgZGF0YTogcmV0QnVmLmdldEJ1ZmZlcigpIH07XG4gIH1cbiAgX19jYWxsX3Byb2NlZHVyZV9fKGlkLCBzZW5kZXIsIGNvbm5lY3Rpb25faWQsIHRpbWVzdGFtcCwgYXJncykge1xuICAgIGNvbnN0IHNlbmRlcklkZW50aXR5ID0gbmV3IElkZW50aXR5KHNlbmRlcik7XG4gICAgY29uc3QgY29ubklkID0gQ29ubmVjdGlvbklkLm51bGxJZlplcm8obmV3IENvbm5lY3Rpb25JZChjb25uZWN0aW9uX2lkKSk7XG4gICAgY29uc3QgdHMgPSBuZXcgVGltZXN0YW1wKHRpbWVzdGFtcCk7XG4gICAgaWYgKGlkIDwgdGhpcy4jY29uc3VtZXJQcm9jZWR1cmVDb3VudCkge1xuICAgICAgcmV0dXJuIGNhbGxQcm9jZWR1cmUoXG4gICAgICAgIHRoaXMuI3NjaGVtYS5wcm9jZWR1cmVzLFxuICAgICAgICBpZCxcbiAgICAgICAgc2VuZGVySWRlbnRpdHksXG4gICAgICAgIGNvbm5JZCxcbiAgICAgICAgdHMsXG4gICAgICAgIGFyZ3MsXG4gICAgICAgICgpID0+IHRoaXMuI2RiVmlldyxcbiAgICAgICAgdGhpcy4jc2NoZW1hLnN1Ym1vZHVsZURpc3BhdGNoSW5mb3NcbiAgICAgICk7XG4gICAgfVxuICAgIGxldCBvZmZzZXQgPSB0aGlzLiNjb25zdW1lclByb2NlZHVyZUNvdW50O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy4jZmxhdFN1Ym1vZHVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG0gPSB0aGlzLiNmbGF0U3VibW9kdWxlc1tpXTtcbiAgICAgIGlmIChpZCA8IG9mZnNldCArIG0ucHJvY2VkdXJlRm5zLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gY2FsbFByb2NlZHVyZShcbiAgICAgICAgICBtLnByb2NlZHVyZUZucyxcbiAgICAgICAgICBpZCAtIG9mZnNldCxcbiAgICAgICAgICBzZW5kZXJJZGVudGl0eSxcbiAgICAgICAgICBjb25uSWQsXG4gICAgICAgICAgdHMsXG4gICAgICAgICAgYXJncyxcbiAgICAgICAgICAoKSA9PiB0aGlzLiNnZXRTdWJtb2R1bGVEYlZpZXcoaSksXG4gICAgICAgICAgbS5zdWJEaXNwYXRjaGVzLFxuICAgICAgICAgIG0ubmFtZVByZWZpeFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgb2Zmc2V0ICs9IG0ucHJvY2VkdXJlRm5zLmxlbmd0aDtcbiAgICB9XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYHVua25vd24gcHJvY2VkdXJlSWQgJHtpZH1gKTtcbiAgfVxuICBfX2NhbGxfaHR0cF9oYW5kbGVyX18oaWQsIHRpbWVzdGFtcCwgcmVxdWVzdCwgYm9keSkge1xuICAgIGNvbnN0IG1vZHVsZUN0eCA9IHRoaXMuI3NjaGVtYTtcbiAgICBjb25zdCBoYW5kbGVyID0gbW9kdWxlQ3R4Lmh0dHBIYW5kbGVyc1tpZF07XG4gICAgY29uc3QgY3R4ID0gbmV3IEhhbmRsZXJDb250ZXh0SW1wbChcbiAgICAgIG5ldyBUaW1lc3RhbXAodGltZXN0YW1wKSxcbiAgICAgICgpID0+IHRoaXMuI2RiVmlldyxcbiAgICAgIHRoaXMuI3NjaGVtYS5zdWJtb2R1bGVEaXNwYXRjaEluZm9zXG4gICAgKTtcbiAgICBjb25zdCByZXF1ZXN0TWV0YWRhdGEgPSBIdHRwUmVxdWVzdC5kZXNlcmlhbGl6ZShuZXcgQmluYXJ5UmVhZGVyKHJlcXVlc3QpKTtcbiAgICBjb25zdCByZXNwb25zZSA9IGNhbGxVc2VyRnVuY3Rpb24oXG4gICAgICBoYW5kbGVyLFxuICAgICAgY3R4LFxuICAgICAgcmVxdWVzdEZyb21XaXJlKHJlcXVlc3RNZXRhZGF0YSwgYm9keSlcbiAgICApO1xuICAgIGNvbnN0IFtyZXNwb25zZU1ldGFkYXRhLCByZXNwb25zZUJvZHldID0gcmVzcG9uc2VJbnRvV2lyZShyZXNwb25zZSk7XG4gICAgY29uc3QgcmVzcG9uc2VCdWYgPSBuZXcgQmluYXJ5V3JpdGVyKFxuICAgICAgYnNhdG5CYXNlU2l6ZShtb2R1bGVDdHgudHlwZXNwYWNlLCBIdHRwUmVzcG9uc2UuYWxnZWJyYWljVHlwZSlcbiAgICApO1xuICAgIEh0dHBSZXNwb25zZS5zZXJpYWxpemUocmVzcG9uc2VCdWYsIHJlc3BvbnNlTWV0YWRhdGEpO1xuICAgIHJldHVybiBbcmVzcG9uc2VCdWYuZ2V0QnVmZmVyKCksIHJlc3BvbnNlQm9keV07XG4gIH1cbn07XG52YXIgQklOQVJZX1dSSVRFUiA9IG5ldyBCaW5hcnlXcml0ZXIoMCk7XG52YXIgQklOQVJZX1JFQURFUiA9IG5ldyBCaW5hcnlSZWFkZXIobmV3IFVpbnQ4QXJyYXkoKSk7XG52YXIgSGFuZGxlckNvbnRleHRJbXBsID0gY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcih0aW1lc3RhbXAsIGRiVmlldywgZGlzcGF0Y2hlcyA9IFtdKSB7XG4gICAgdGhpcy50aW1lc3RhbXAgPSB0aW1lc3RhbXA7XG4gICAgdGhpcy4jZGJWaWV3ID0gZGJWaWV3O1xuICAgIHRoaXMuI2Rpc3BhdGNoZXMgPSBkaXNwYXRjaGVzO1xuICB9XG4gIGVudiA9IGVudmlyb25tZW50O1xuICAjaWRlbnRpdHk7XG4gICN1dWlkQ291bnRlcjtcbiAgI3JhbmRvbTtcbiAgI2RiVmlldztcbiAgI2Rpc3BhdGNoZXM7XG4gICNhc1ZpZXdzO1xuICBodHRwID0gaHR0cENsaWVudDtcbiAgZ2V0IGlkZW50aXR5KCkge1xuICAgIHJldHVybiB0aGlzLiNpZGVudGl0eSA/Pz0gbmV3IElkZW50aXR5KHN5czIuaWRlbnRpdHkoKSk7XG4gIH1cbiAgZ2V0IHJhbmRvbSgpIHtcbiAgICByZXR1cm4gdGhpcy4jcmFuZG9tID8/PSBtYWtlUmFuZG9tKHRoaXMudGltZXN0YW1wKTtcbiAgfVxuICBnZXQgYXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2FzVmlld3MgPz89IGJ1aWxkSGFuZGxlckFsaWFzQ3R4TWFwKFxuICAgICAgdGhpcyxcbiAgICAgIHRoaXMuI2Rpc3BhdGNoZXMsXG4gICAgICBcIlwiXG4gICAgKTtcbiAgfVxuICB3aXRoVHgoYm9keSkge1xuICAgIGNvbnN0IGRpc3BhdGNoZXMgPSB0aGlzLiNkaXNwYXRjaGVzO1xuICAgIHJldHVybiBydW5XaXRoVHgoKHRpbWVzdGFtcCkgPT4ge1xuICAgICAgY29uc3QgdHggPSBuZXcgUmVkdWNlckN0eEltcGwoXG4gICAgICAgIElkZW50aXR5Lnplcm8oKSxcbiAgICAgICAgdGltZXN0YW1wLFxuICAgICAgICBudWxsLFxuICAgICAgICB0aGlzLiNkYlZpZXcoKVxuICAgICAgKTtcbiAgICAgIGlmIChkaXNwYXRjaGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdHguYXMgPSBidWlsZEFsaWFzQ3R4TWFwKHR4LCBkaXNwYXRjaGVzLCBcIlwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0eDtcbiAgICB9LCBib2R5KTtcbiAgfVxuICBuZXdVdWlkVjQoKSB7XG4gICAgY29uc3QgYnl0ZXMgPSB0aGlzLnJhbmRvbS5maWxsKG5ldyBVaW50OEFycmF5KDE2KSk7XG4gICAgcmV0dXJuIFV1aWQuZnJvbVJhbmRvbUJ5dGVzVjQoYnl0ZXMpO1xuICB9XG4gIG5ld1V1aWRWNygpIHtcbiAgICBjb25zdCBieXRlcyA9IHRoaXMucmFuZG9tLmZpbGwobmV3IFVpbnQ4QXJyYXkoNCkpO1xuICAgIGNvbnN0IGNvdW50ZXIgPSB0aGlzLiN1dWlkQ291bnRlciA/Pz0geyB2YWx1ZTogMCB9O1xuICAgIHJldHVybiBVdWlkLmZyb21Db3VudGVyVjcoY291bnRlciwgdGhpcy50aW1lc3RhbXAsIGJ5dGVzKTtcbiAgfVxufTtcbmZ1bmN0aW9uIGJ1aWxkRGJWaWV3Rm9yRGlzcGF0Y2goZGlzcGF0Y2gsIG5hbWVQcmVmaXgpIHtcbiAgY29uc3QgdGFibGVFbnRyaWVzID0gZGlzcGF0Y2gudGFibGVzLm1hcCgoeyBhY2Nlc3Nvck5hbWUsIHRhYmxlRGVmIH0pID0+IFtcbiAgICBhY2Nlc3Nvck5hbWUsXG4gICAgbWFrZVRhYmxlVmlldyhkaXNwYXRjaC50eXBlc3BhY2UsIHRhYmxlRGVmLCBuYW1lUHJlZml4KVxuICBdKTtcbiAgY29uc3Qgc3ViTnNFbnRyaWVzID0gZGlzcGF0Y2guc3ViRGlzcGF0Y2hlcy5tYXAoKHN1YikgPT4gW1xuICAgIHN1Yi5uYW1lc3BhY2UsXG4gICAgYnVpbGREYlZpZXdGb3JEaXNwYXRjaChzdWIsIG5hbWVQcmVmaXggKyBzdWIubmFtZXNwYWNlICsgXCIuXCIpXG4gIF0pO1xuICByZXR1cm4gZnJlZXplKE9iamVjdC5mcm9tRW50cmllcyhbLi4udGFibGVFbnRyaWVzLCAuLi5zdWJOc0VudHJpZXNdKSk7XG59XG5mdW5jdGlvbiBidWlsZEFsaWFzQ3R4KHBhcmVudCwgZGlzcGF0Y2gsIG5hbWVQcmVmaXgpIHtcbiAgY29uc3QgbnNEYiA9IGJ1aWxkRGJWaWV3Rm9yRGlzcGF0Y2goZGlzcGF0Y2gsIG5hbWVQcmVmaXgpO1xuICBjb25zdCBzdWJBcyA9IGJ1aWxkQWxpYXNDdHhNYXAocGFyZW50LCBkaXNwYXRjaC5zdWJEaXNwYXRjaGVzLCBuYW1lUHJlZml4KTtcbiAgcmV0dXJuIHtcbiAgICBnZXQgc2VuZGVyKCkge1xuICAgICAgcmV0dXJuIHBhcmVudC5zZW5kZXI7XG4gICAgfSxcbiAgICBnZXQgZGF0YWJhc2VJZGVudGl0eSgpIHtcbiAgICAgIHJldHVybiBwYXJlbnQuZGF0YWJhc2VJZGVudGl0eTtcbiAgICB9LFxuICAgIGdldCBpZGVudGl0eSgpIHtcbiAgICAgIHJldHVybiBwYXJlbnQuaWRlbnRpdHk7XG4gICAgfSxcbiAgICBnZXQgdGltZXN0YW1wKCkge1xuICAgICAgcmV0dXJuIHBhcmVudC50aW1lc3RhbXA7XG4gICAgfSxcbiAgICBnZXQgY29ubmVjdGlvbklkKCkge1xuICAgICAgcmV0dXJuIHBhcmVudC5jb25uZWN0aW9uSWQ7XG4gICAgfSxcbiAgICBnZXQgc2VuZGVyQXV0aCgpIHtcbiAgICAgIHJldHVybiBwYXJlbnQuc2VuZGVyQXV0aDtcbiAgICB9LFxuICAgIGdldCByYW5kb20oKSB7XG4gICAgICByZXR1cm4gcGFyZW50LnJhbmRvbTtcbiAgICB9LFxuICAgIG5ld1V1aWRWNCgpIHtcbiAgICAgIHJldHVybiBwYXJlbnQubmV3VXVpZFY0KCk7XG4gICAgfSxcbiAgICBuZXdVdWlkVjcoKSB7XG4gICAgICByZXR1cm4gcGFyZW50Lm5ld1V1aWRWNygpO1xuICAgIH0sXG4gICAgZGI6IG5zRGIsXG4gICAgYXM6IHN1YkFzXG4gIH07XG59XG5mdW5jdGlvbiBidWlsZEFsaWFzQ3R4TWFwKHBhcmVudCwgZGlzcGF0Y2hlcywgcGFyZW50UHJlZml4KSB7XG4gIHJldHVybiBmcmVlemUoXG4gICAgT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgZGlzcGF0Y2hlcy5tYXAoKGQpID0+IFtcbiAgICAgICAgZC5uYW1lc3BhY2UsXG4gICAgICAgIGJ1aWxkQWxpYXNDdHgocGFyZW50LCBkLCBwYXJlbnRQcmVmaXggKyBkLm5hbWVzcGFjZSArIFwiLlwiKVxuICAgICAgXSlcbiAgICApXG4gICk7XG59XG5mdW5jdGlvbiBidWlsZEhhbmRsZXJBbGlhc0N0eChwYXJlbnQsIGRpc3BhdGNoLCBuYW1lUHJlZml4KSB7XG4gIGxldCBuc0RiXztcbiAgY29uc3Qgc3ViQXMgPSBidWlsZEhhbmRsZXJBbGlhc0N0eE1hcChcbiAgICBwYXJlbnQsXG4gICAgZGlzcGF0Y2guc3ViRGlzcGF0Y2hlcyxcbiAgICBuYW1lUHJlZml4XG4gICk7XG4gIHJldHVybiB7XG4gICAgZ2V0IHRpbWVzdGFtcCgpIHtcbiAgICAgIHJldHVybiBwYXJlbnQudGltZXN0YW1wO1xuICAgIH0sXG4gICAgZ2V0IGh0dHAoKSB7XG4gICAgICByZXR1cm4gcGFyZW50Lmh0dHA7XG4gICAgfSxcbiAgICBnZXQgaWRlbnRpdHkoKSB7XG4gICAgICByZXR1cm4gcGFyZW50LmlkZW50aXR5O1xuICAgIH0sXG4gICAgZ2V0IHJhbmRvbSgpIHtcbiAgICAgIHJldHVybiBwYXJlbnQucmFuZG9tO1xuICAgIH0sXG4gICAgYXM6IHN1YkFzLFxuICAgIHdpdGhUeChib2R5KSB7XG4gICAgICByZXR1cm4gcnVuV2l0aFR4KCh0cykgPT4ge1xuICAgICAgICBjb25zdCB0eCA9IG5ldyBSZWR1Y2VyQ3R4SW1wbChcbiAgICAgICAgICBJZGVudGl0eS56ZXJvKCksXG4gICAgICAgICAgdHMsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBuc0RiXyA/Pz0gYnVpbGREYlZpZXdGb3JEaXNwYXRjaChcbiAgICAgICAgICAgIGRpc3BhdGNoLFxuICAgICAgICAgICAgbmFtZVByZWZpeFxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgICAgYXNzaWduVHhBbGlhc1ZpZXdzKHR4LCBkaXNwYXRjaC5zdWJEaXNwYXRjaGVzLCBuYW1lUHJlZml4KTtcbiAgICAgICAgcmV0dXJuIHR4O1xuICAgICAgfSwgYm9keSk7XG4gICAgfSxcbiAgICBuZXdVdWlkVjQoKSB7XG4gICAgICByZXR1cm4gcGFyZW50Lm5ld1V1aWRWNCgpO1xuICAgIH0sXG4gICAgbmV3VXVpZFY3KCkge1xuICAgICAgcmV0dXJuIHBhcmVudC5uZXdVdWlkVjcoKTtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiBidWlsZEhhbmRsZXJBbGlhc0N0eE1hcChwYXJlbnQsIGRpc3BhdGNoZXMsIHBhcmVudFByZWZpeCkge1xuICByZXR1cm4gZnJlZXplKFxuICAgIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgIGRpc3BhdGNoZXMubWFwKChkKSA9PiBbXG4gICAgICAgIGQubmFtZXNwYWNlLFxuICAgICAgICBidWlsZEhhbmRsZXJBbGlhc0N0eChwYXJlbnQsIGQsIHBhcmVudFByZWZpeCArIGQubmFtZXNwYWNlICsgXCIuXCIpXG4gICAgICBdKVxuICAgIClcbiAgKTtcbn1cbmZ1bmN0aW9uIGJ1aWxkUHJvY2VkdXJlQWxpYXNDdHgocGFyZW50LCBkaXNwYXRjaCwgbmFtZVByZWZpeCkge1xuICBsZXQgbnNEYl87XG4gIGNvbnN0IHN1YkFzID0gYnVpbGRQcm9jZWR1cmVBbGlhc0N0eE1hcChcbiAgICBwYXJlbnQsXG4gICAgZGlzcGF0Y2guc3ViRGlzcGF0Y2hlcyxcbiAgICBuYW1lUHJlZml4XG4gICk7XG4gIHJldHVybiB7XG4gICAgZ2V0IHNlbmRlcigpIHtcbiAgICAgIHJldHVybiBwYXJlbnQuc2VuZGVyO1xuICAgIH0sXG4gICAgZ2V0IGRhdGFiYXNlSWRlbnRpdHkoKSB7XG4gICAgICByZXR1cm4gcGFyZW50LmRhdGFiYXNlSWRlbnRpdHk7XG4gICAgfSxcbiAgICBnZXQgaWRlbnRpdHkoKSB7XG4gICAgICByZXR1cm4gcGFyZW50LmlkZW50aXR5O1xuICAgIH0sXG4gICAgZ2V0IHRpbWVzdGFtcCgpIHtcbiAgICAgIHJldHVybiBwYXJlbnQudGltZXN0YW1wO1xuICAgIH0sXG4gICAgZ2V0IGNvbm5lY3Rpb25JZCgpIHtcbiAgICAgIHJldHVybiBwYXJlbnQuY29ubmVjdGlvbklkO1xuICAgIH0sXG4gICAgZ2V0IGh0dHAoKSB7XG4gICAgICByZXR1cm4gcGFyZW50Lmh0dHA7XG4gICAgfSxcbiAgICBnZXQgcmFuZG9tKCkge1xuICAgICAgcmV0dXJuIHBhcmVudC5yYW5kb207XG4gICAgfSxcbiAgICBzbGVlcChkdXJhdGlvbikge1xuICAgICAgcmV0dXJuIHBhcmVudC5zbGVlcChkdXJhdGlvbik7XG4gICAgfSxcbiAgICBhczogc3ViQXMsXG4gICAgd2l0aFR4KGJvZHkpIHtcbiAgICAgIHJldHVybiBydW5XaXRoVHgoKHRzKSA9PiB7XG4gICAgICAgIGNvbnN0IHR4ID0gbmV3IFJlZHVjZXJDdHhJbXBsKFxuICAgICAgICAgIHBhcmVudC5zZW5kZXIsXG4gICAgICAgICAgdHMsXG4gICAgICAgICAgcGFyZW50LmNvbm5lY3Rpb25JZCxcbiAgICAgICAgICBuc0RiXyA/Pz0gYnVpbGREYlZpZXdGb3JEaXNwYXRjaChcbiAgICAgICAgICAgIGRpc3BhdGNoLFxuICAgICAgICAgICAgbmFtZVByZWZpeFxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgICAgYXNzaWduVHhBbGlhc1ZpZXdzKHR4LCBkaXNwYXRjaC5zdWJEaXNwYXRjaGVzLCBuYW1lUHJlZml4KTtcbiAgICAgICAgcmV0dXJuIHR4O1xuICAgICAgfSwgYm9keSk7XG4gICAgfSxcbiAgICBuZXdVdWlkVjQoKSB7XG4gICAgICByZXR1cm4gcGFyZW50Lm5ld1V1aWRWNCgpO1xuICAgIH0sXG4gICAgbmV3VXVpZFY3KCkge1xuICAgICAgcmV0dXJuIHBhcmVudC5uZXdVdWlkVjcoKTtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiBidWlsZFByb2NlZHVyZUFsaWFzQ3R4TWFwKHBhcmVudCwgZGlzcGF0Y2hlcywgcGFyZW50UHJlZml4KSB7XG4gIHJldHVybiBmcmVlemUoXG4gICAgT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgZGlzcGF0Y2hlcy5tYXAoKGQpID0+IFtcbiAgICAgICAgZC5uYW1lc3BhY2UsXG4gICAgICAgIGJ1aWxkUHJvY2VkdXJlQWxpYXNDdHgocGFyZW50LCBkLCBwYXJlbnRQcmVmaXggKyBkLm5hbWVzcGFjZSArIFwiLlwiKVxuICAgICAgXSlcbiAgICApXG4gICk7XG59XG5mdW5jdGlvbiBhc3NpZ25UeEFsaWFzVmlld3ModHgsIGRpc3BhdGNoZXMsIHBhcmVudFByZWZpeCA9IFwiXCIpIHtcbiAgaWYgKGRpc3BhdGNoZXMubGVuZ3RoID4gMCkge1xuICAgIHR4LmFzID0gYnVpbGRBbGlhc0N0eE1hcCh0eCwgZGlzcGF0Y2hlcywgcGFyZW50UHJlZml4KTtcbiAgfVxufVxuZnVuY3Rpb24gbWFrZVRhYmxlVmlldyh0eXBlc3BhY2UsIHRhYmxlMiwgYmFja2VuZE9yTmFtZVByZWZpeCA9IGhvc3RCYWNrZW5kLCBuYW1lUHJlZml4ID0gXCJcIikge1xuICBjb25zdCBiYWNrZW5kID0gaXNEYXRhc3RvcmVCYWNrZW5kKGJhY2tlbmRPck5hbWVQcmVmaXgpID8gYmFja2VuZE9yTmFtZVByZWZpeCA6IGhvc3RCYWNrZW5kO1xuICBpZiAodHlwZW9mIGJhY2tlbmRPck5hbWVQcmVmaXggPT09IFwic3RyaW5nXCIpIHtcbiAgICBuYW1lUHJlZml4ID0gYmFja2VuZE9yTmFtZVByZWZpeDtcbiAgfVxuICBjb25zdCB0YWJsZV9pZCA9IGJhY2tlbmQudGFibGVJZEZyb21OYW1lKG5hbWVQcmVmaXggKyB0YWJsZTIuc291cmNlTmFtZSk7XG4gIGNvbnN0IHJvd1R5cGUgPSB0eXBlc3BhY2UudHlwZXNbdGFibGUyLnByb2R1Y3RUeXBlUmVmXTtcbiAgaWYgKHJvd1R5cGUudGFnICE9PSBcIlByb2R1Y3RcIikge1xuICAgIHRocm93IFwiaW1wb3NzaWJsZVwiO1xuICB9XG4gIGNvbnN0IHNlcmlhbGl6ZVJvdyA9IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIocm93VHlwZSwgdHlwZXNwYWNlKTtcbiAgY29uc3QgZGVzZXJpYWxpemVSb3cgPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIocm93VHlwZSwgdHlwZXNwYWNlKTtcbiAgY29uc3Qgc2VxdWVuY2VzID0gdGFibGUyLnNlcXVlbmNlcy5tYXAoKHNlcSkgPT4ge1xuICAgIGNvbnN0IGNvbCA9IHJvd1R5cGUudmFsdWUuZWxlbWVudHNbc2VxLmNvbHVtbl07XG4gICAgY29uc3QgY29sVHlwZSA9IGNvbC5hbGdlYnJhaWNUeXBlO1xuICAgIGxldCBzZXF1ZW5jZVRyaWdnZXI7XG4gICAgc3dpdGNoIChjb2xUeXBlLnRhZykge1xuICAgICAgY2FzZSBcIlU4XCI6XG4gICAgICBjYXNlIFwiSThcIjpcbiAgICAgIGNhc2UgXCJVMTZcIjpcbiAgICAgIGNhc2UgXCJJMTZcIjpcbiAgICAgIGNhc2UgXCJVMzJcIjpcbiAgICAgIGNhc2UgXCJJMzJcIjpcbiAgICAgICAgc2VxdWVuY2VUcmlnZ2VyID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiVTY0XCI6XG4gICAgICBjYXNlIFwiSTY0XCI6XG4gICAgICBjYXNlIFwiVTEyOFwiOlxuICAgICAgY2FzZSBcIkkxMjhcIjpcbiAgICAgIGNhc2UgXCJVMjU2XCI6XG4gICAgICBjYXNlIFwiSTI1NlwiOlxuICAgICAgICBzZXF1ZW5jZVRyaWdnZXIgPSAwbjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiaW52YWxpZCBzZXF1ZW5jZSB0eXBlXCIpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgY29sTmFtZTogY29sLm5hbWUsXG4gICAgICBzZXF1ZW5jZVRyaWdnZXIsXG4gICAgICBkZXNlcmlhbGl6ZTogQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKGNvbFR5cGUsIHR5cGVzcGFjZSlcbiAgICB9O1xuICB9KTtcbiAgY29uc3QgaGFzQXV0b0luY3JlbWVudCA9IHNlcXVlbmNlcy5sZW5ndGggPiAwO1xuICBjb25zdCBpdGVyID0gKCkgPT4gdGFibGVJdGVyYXRvcihcbiAgICBiYWNrZW5kLmRhdGFzdG9yZVRhYmxlU2NhbkJzYXRuKHRhYmxlX2lkKSxcbiAgICBkZXNlcmlhbGl6ZVJvdyxcbiAgICBiYWNrZW5kXG4gICk7XG4gIGNvbnN0IGludGVncmF0ZUdlbmVyYXRlZENvbHVtbnMgPSBoYXNBdXRvSW5jcmVtZW50ID8gKHJvdywgcmV0X2J1ZikgPT4ge1xuICAgIEJJTkFSWV9SRUFERVIucmVzZXQocmV0X2J1Zik7XG4gICAgZm9yIChjb25zdCB7IGNvbE5hbWUsIGRlc2VyaWFsaXplLCBzZXF1ZW5jZVRyaWdnZXIgfSBvZiBzZXF1ZW5jZXMpIHtcbiAgICAgIGlmIChyb3dbY29sTmFtZV0gPT09IHNlcXVlbmNlVHJpZ2dlcikge1xuICAgICAgICByb3dbY29sTmFtZV0gPSBkZXNlcmlhbGl6ZShCSU5BUllfUkVBREVSKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gOiBudWxsO1xuICBjb25zdCBnZW5lcmF0ZWRDb2x1bW5zVmlldyA9IChnZW5lcmF0ZWQsIGZhbGxiYWNrKSA9PiBnZW5lcmF0ZWQgaW5zdGFuY2VvZiBVaW50OEFycmF5ID8gbmV3IERhdGFWaWV3KFxuICAgIGdlbmVyYXRlZC5idWZmZXIsXG4gICAgZ2VuZXJhdGVkLmJ5dGVPZmZzZXQsXG4gICAgZ2VuZXJhdGVkLmJ5dGVMZW5ndGhcbiAgKSA6IGZhbGxiYWNrO1xuICBjb25zdCB0YWJsZU1ldGhvZHMgPSB7XG4gICAgY291bnQ6ICgpID0+IEJpZ0ludChiYWNrZW5kLmRhdGFzdG9yZVRhYmxlUm93Q291bnQodGFibGVfaWQpKSxcbiAgICBpdGVyLFxuICAgIFtTeW1ib2wuaXRlcmF0b3JdOiAoKSA9PiBpdGVyKCksXG4gICAgaW5zZXJ0OiAocm93KSA9PiB7XG4gICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgIEJJTkFSWV9XUklURVIucmVzZXQoYnVmKTtcbiAgICAgIHNlcmlhbGl6ZVJvdyhCSU5BUllfV1JJVEVSLCByb3cpO1xuICAgICAgY29uc3QgZ2VuZXJhdGVkID0gYmFja2VuZC5kYXRhc3RvcmVJbnNlcnRCc2F0bihcbiAgICAgICAgdGFibGVfaWQsXG4gICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgIEJJTkFSWV9XUklURVIub2Zmc2V0XG4gICAgICApO1xuICAgICAgY29uc3QgcmV0ID0geyAuLi5yb3cgfTtcbiAgICAgIGludGVncmF0ZUdlbmVyYXRlZENvbHVtbnM/LihcbiAgICAgICAgcmV0LFxuICAgICAgICBnZW5lcmF0ZWRDb2x1bW5zVmlldyhnZW5lcmF0ZWQsIGJ1Zi52aWV3KVxuICAgICAgKTtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSxcbiAgICBkZWxldGU6IChyb3cpID0+IHtcbiAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xuICAgICAgQklOQVJZX1dSSVRFUi5yZXNldChidWYpO1xuICAgICAgQklOQVJZX1dSSVRFUi53cml0ZVUzMigxKTtcbiAgICAgIHNlcmlhbGl6ZVJvdyhCSU5BUllfV1JJVEVSLCByb3cpO1xuICAgICAgY29uc3QgY291bnQgPSBiYWNrZW5kLmRhdGFzdG9yZURlbGV0ZUFsbEJ5RXFCc2F0bihcbiAgICAgICAgdGFibGVfaWQsXG4gICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgIEJJTkFSWV9XUklURVIub2Zmc2V0XG4gICAgICApO1xuICAgICAgcmV0dXJuIGNvdW50ID4gMDtcbiAgICB9LFxuICAgIGNsZWFyOiAoKSA9PiB7XG4gICAgICBjb25zdCBjb3VudCA9IEJpZ0ludChiYWNrZW5kLmRhdGFzdG9yZVRhYmxlUm93Q291bnQodGFibGVfaWQpKTtcbiAgICAgIGJhY2tlbmQuZGF0YXN0b3JlQ2xlYXIodGFibGVfaWQpO1xuICAgICAgcmV0dXJuIGNvdW50O1xuICAgIH1cbiAgfTtcbiAgY29uc3QgdGFibGVWaWV3ID0gT2JqZWN0LmFzc2lnbihcbiAgICAvKiBAX19QVVJFX18gKi8gT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICB0YWJsZU1ldGhvZHNcbiAgKTtcbiAgZm9yIChjb25zdCBpbmRleERlZiBvZiB0YWJsZTIuaW5kZXhlcykge1xuICAgIGNvbnN0IGFjY2Vzc29yTmFtZSA9IGluZGV4RGVmLmFjY2Vzc29yTmFtZTtcbiAgICBjb25zdCBpbmRleF9pZCA9IGJhY2tlbmQuaW5kZXhJZEZyb21OYW1lKG5hbWVQcmVmaXggKyBpbmRleERlZi5zb3VyY2VOYW1lKTtcbiAgICBsZXQgY29sdW1uX2lkcztcbiAgICBsZXQgaXNIYXNoSW5kZXggPSBmYWxzZTtcbiAgICBzd2l0Y2ggKGluZGV4RGVmLmFsZ29yaXRobS50YWcpIHtcbiAgICAgIGNhc2UgXCJIYXNoXCI6XG4gICAgICAgIGlzSGFzaEluZGV4ID0gdHJ1ZTtcbiAgICAgICAgY29sdW1uX2lkcyA9IGluZGV4RGVmLmFsZ29yaXRobS52YWx1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiQlRyZWVcIjpcbiAgICAgICAgY29sdW1uX2lkcyA9IGluZGV4RGVmLmFsZ29yaXRobS52YWx1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiRGlyZWN0XCI6XG4gICAgICAgIGNvbHVtbl9pZHMgPSBbaW5kZXhEZWYuYWxnb3JpdGhtLnZhbHVlXTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNvbnN0IG51bUNvbHVtbnMgPSBjb2x1bW5faWRzLmxlbmd0aDtcbiAgICBjb25zdCBjb2x1bW5TZXQgPSBuZXcgU2V0KGNvbHVtbl9pZHMpO1xuICAgIGNvbnN0IGlzVW5pcXVlID0gdGFibGUyLmNvbnN0cmFpbnRzLmZpbHRlcigoeCkgPT4geC5kYXRhLnRhZyA9PT0gXCJVbmlxdWVcIikuc29tZSgoeCkgPT4ge1xuICAgICAgY29uc3QgY29uc3RyYWludENvbHVtbnMgPSBuZXcgU2V0KHguZGF0YS52YWx1ZS5jb2x1bW5zKTtcbiAgICAgIHJldHVybiBbLi4uY29sdW1uU2V0XS5ldmVyeSgoY29sdW1uKSA9PiBjb25zdHJhaW50Q29sdW1ucy5oYXMoY29sdW1uKSk7XG4gICAgfSk7XG4gICAgY29uc3QgaXNQcmltYXJ5S2V5ID0gaXNVbmlxdWUgJiYgY29sdW1uX2lkcy5sZW5ndGggPT09IHRhYmxlMi5wcmltYXJ5S2V5Lmxlbmd0aCAmJiBjb2x1bW5faWRzLmV2ZXJ5KChpZCwgaSkgPT4gdGFibGUyLnByaW1hcnlLZXlbaV0gPT09IGlkKTtcbiAgICBjb25zdCBpbmRleFNlcmlhbGl6ZXJzID0gY29sdW1uX2lkcy5tYXAoXG4gICAgICAoaWQpID0+IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIoXG4gICAgICAgIHJvd1R5cGUudmFsdWUuZWxlbWVudHNbaWRdLmFsZ2VicmFpY1R5cGUsXG4gICAgICAgIHR5cGVzcGFjZVxuICAgICAgKVxuICAgICk7XG4gICAgY29uc3Qgc2VyaWFsaXplUG9pbnQgPSAoYnVmZmVyLCBjb2xWYWwpID0+IHtcbiAgICAgIEJJTkFSWV9XUklURVIucmVzZXQoYnVmZmVyKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtQ29sdW1uczsgaSsrKSB7XG4gICAgICAgIGluZGV4U2VyaWFsaXplcnNbaV0oQklOQVJZX1dSSVRFUiwgY29sVmFsW2ldKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBCSU5BUllfV1JJVEVSLm9mZnNldDtcbiAgICB9O1xuICAgIGNvbnN0IHNlcmlhbGl6ZVNpbmdsZUVsZW1lbnQgPSBudW1Db2x1bW5zID09PSAxID8gaW5kZXhTZXJpYWxpemVyc1swXSA6IG51bGw7XG4gICAgY29uc3Qgc2VyaWFsaXplU2luZ2xlUG9pbnQgPSBzZXJpYWxpemVTaW5nbGVFbGVtZW50ICYmICgoYnVmZmVyLCBjb2xWYWwpID0+IHtcbiAgICAgIEJJTkFSWV9XUklURVIucmVzZXQoYnVmZmVyKTtcbiAgICAgIHNlcmlhbGl6ZVNpbmdsZUVsZW1lbnQoQklOQVJZX1dSSVRFUiwgY29sVmFsKTtcbiAgICAgIHJldHVybiBCSU5BUllfV1JJVEVSLm9mZnNldDtcbiAgICB9KTtcbiAgICBsZXQgaW5kZXg7XG4gICAgaWYgKGlzVW5pcXVlICYmIHNlcmlhbGl6ZVNpbmdsZVBvaW50KSB7XG4gICAgICBjb25zdCBiYXNlID0ge1xuICAgICAgICBmaW5kOiAoY29sVmFsKSA9PiB7XG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplU2luZ2xlUG9pbnQoYnVmLCBjb2xWYWwpO1xuICAgICAgICAgIGNvbnN0IGl0ZXJfaWQgPSBiYWNrZW5kLmRhdGFzdG9yZUluZGV4U2NhblBvaW50QnNhdG4oXG4gICAgICAgICAgICBpbmRleF9pZCxcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICBwb2ludF9sZW5cbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiB0YWJsZUl0ZXJhdGVPbmUoaXRlcl9pZCwgZGVzZXJpYWxpemVSb3csIGJhY2tlbmQpO1xuICAgICAgICB9LFxuICAgICAgICBkZWxldGU6IChjb2xWYWwpID0+IHtcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgICAgICBjb25zdCBwb2ludF9sZW4gPSBzZXJpYWxpemVTaW5nbGVQb2ludChidWYsIGNvbFZhbCk7XG4gICAgICAgICAgY29uc3QgbnVtID0gYmFja2VuZC5kYXRhc3RvcmVEZWxldGVCeUluZGV4U2NhblBvaW50QnNhdG4oXG4gICAgICAgICAgICBpbmRleF9pZCxcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICBwb2ludF9sZW5cbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiBudW0gPiAwO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgaWYgKGlzUHJpbWFyeUtleSkge1xuICAgICAgICBiYXNlLnVwZGF0ZSA9IChyb3cpID0+IHtcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1Zik7XG4gICAgICAgICAgc2VyaWFsaXplUm93KEJJTkFSWV9XUklURVIsIHJvdyk7XG4gICAgICAgICAgY29uc3QgZ2VuZXJhdGVkID0gYmFja2VuZC5kYXRhc3RvcmVVcGRhdGVCc2F0bihcbiAgICAgICAgICAgIHRhYmxlX2lkLFxuICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgQklOQVJZX1dSSVRFUi5vZmZzZXRcbiAgICAgICAgICApO1xuICAgICAgICAgIGludGVncmF0ZUdlbmVyYXRlZENvbHVtbnM/LihcbiAgICAgICAgICAgIHJvdyxcbiAgICAgICAgICAgIGdlbmVyYXRlZENvbHVtbnNWaWV3KGdlbmVyYXRlZCwgYnVmLnZpZXcpXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gcm93O1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaW5kZXggPSBiYXNlO1xuICAgIH0gZWxzZSBpZiAoaXNVbmlxdWUpIHtcbiAgICAgIGNvbnN0IGJhc2UgPSB7XG4gICAgICAgIGZpbmQ6IChjb2xWYWwpID0+IHtcbiAgICAgICAgICBpZiAoY29sVmFsLmxlbmd0aCAhPT0gbnVtQ29sdW1ucykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIndyb25nIG51bWJlciBvZiBlbGVtZW50c1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplUG9pbnQoYnVmLCBjb2xWYWwpO1xuICAgICAgICAgIGNvbnN0IGl0ZXJfaWQgPSBiYWNrZW5kLmRhdGFzdG9yZUluZGV4U2NhblBvaW50QnNhdG4oXG4gICAgICAgICAgICBpbmRleF9pZCxcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICBwb2ludF9sZW5cbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiB0YWJsZUl0ZXJhdGVPbmUoaXRlcl9pZCwgZGVzZXJpYWxpemVSb3csIGJhY2tlbmQpO1xuICAgICAgICB9LFxuICAgICAgICBkZWxldGU6IChjb2xWYWwpID0+IHtcbiAgICAgICAgICBpZiAoY29sVmFsLmxlbmd0aCAhPT0gbnVtQ29sdW1ucylcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJ3cm9uZyBudW1iZXIgb2YgZWxlbWVudHNcIik7XG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplUG9pbnQoYnVmLCBjb2xWYWwpO1xuICAgICAgICAgIGNvbnN0IG51bSA9IGJhY2tlbmQuZGF0YXN0b3JlRGVsZXRlQnlJbmRleFNjYW5Qb2ludEJzYXRuKFxuICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgcG9pbnRfbGVuXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gbnVtID4gMDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGlmIChpc1ByaW1hcnlLZXkpIHtcbiAgICAgICAgYmFzZS51cGRhdGUgPSAocm93KSA9PiB7XG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgQklOQVJZX1dSSVRFUi5yZXNldChidWYpO1xuICAgICAgICAgIHNlcmlhbGl6ZVJvdyhCSU5BUllfV1JJVEVSLCByb3cpO1xuICAgICAgICAgIGNvbnN0IGdlbmVyYXRlZCA9IGJhY2tlbmQuZGF0YXN0b3JlVXBkYXRlQnNhdG4oXG4gICAgICAgICAgICB0YWJsZV9pZCxcbiAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgIEJJTkFSWV9XUklURVIub2Zmc2V0XG4gICAgICAgICAgKTtcbiAgICAgICAgICBpbnRlZ3JhdGVHZW5lcmF0ZWRDb2x1bW5zPy4oXG4gICAgICAgICAgICByb3csXG4gICAgICAgICAgICBnZW5lcmF0ZWRDb2x1bW5zVmlldyhnZW5lcmF0ZWQsIGJ1Zi52aWV3KVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIHJvdztcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGluZGV4ID0gYmFzZTtcbiAgICB9IGVsc2UgaWYgKHNlcmlhbGl6ZVNpbmdsZVBvaW50KSB7XG4gICAgICBjb25zdCBzZXJpYWxpemVTaW5nbGVSYW5nZSA9ICFpc0hhc2hJbmRleCA/IChidWZmZXIsIHJhbmdlKSA9PiB7XG4gICAgICAgIEJJTkFSWV9XUklURVIucmVzZXQoYnVmZmVyKTtcbiAgICAgICAgY29uc3Qgd3JpdGVyID0gQklOQVJZX1dSSVRFUjtcbiAgICAgICAgY29uc3Qgd3JpdGVCb3VuZCA9IChib3VuZCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHRhZ3MgPSB7IGluY2x1ZGVkOiAwLCBleGNsdWRlZDogMSwgdW5ib3VuZGVkOiAyIH07XG4gICAgICAgICAgd3JpdGVyLndyaXRlVTgodGFnc1tib3VuZC50YWddKTtcbiAgICAgICAgICBpZiAoYm91bmQudGFnICE9PSBcInVuYm91bmRlZFwiKVxuICAgICAgICAgICAgc2VyaWFsaXplU2luZ2xlRWxlbWVudCh3cml0ZXIsIGJvdW5kLnZhbHVlKTtcbiAgICAgICAgfTtcbiAgICAgICAgd3JpdGVCb3VuZChyYW5nZS5mcm9tKTtcbiAgICAgICAgY29uc3QgcnN0YXJ0TGVuID0gd3JpdGVyLm9mZnNldDtcbiAgICAgICAgd3JpdGVCb3VuZChyYW5nZS50byk7XG4gICAgICAgIGNvbnN0IHJlbmRMZW4gPSB3cml0ZXIub2Zmc2V0IC0gcnN0YXJ0TGVuO1xuICAgICAgICByZXR1cm4gWzAsIDAsIHJzdGFydExlbiwgcmVuZExlbl07XG4gICAgICB9IDogbnVsbDtcbiAgICAgIGNvbnN0IHJhd0luZGV4ID0ge1xuICAgICAgICBmaWx0ZXI6IChyYW5nZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xuICAgICAgICAgIGlmIChzZXJpYWxpemVTaW5nbGVSYW5nZSAmJiByYW5nZSBpbnN0YW5jZW9mIFJhbmdlKSB7XG4gICAgICAgICAgICBjb25zdCBhcmdzID0gc2VyaWFsaXplU2luZ2xlUmFuZ2UoYnVmLCByYW5nZSk7XG4gICAgICAgICAgICBjb25zdCBpdGVyX2lkMiA9IGJhY2tlbmQuZGF0YXN0b3JlSW5kZXhTY2FuUmFuZ2VCc2F0bihcbiAgICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICAgIC4uLmFyZ3NcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gdGFibGVJdGVyYXRvcihpdGVyX2lkMiwgZGVzZXJpYWxpemVSb3csIGJhY2tlbmQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBwb2ludF9sZW4gPSBzZXJpYWxpemVTaW5nbGVQb2ludChidWYsIHJhbmdlKTtcbiAgICAgICAgICBjb25zdCBpdGVyX2lkID0gYmFja2VuZC5kYXRhc3RvcmVJbmRleFNjYW5Qb2ludEJzYXRuKFxuICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgcG9pbnRfbGVuXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gdGFibGVJdGVyYXRvcihpdGVyX2lkLCBkZXNlcmlhbGl6ZVJvdywgYmFja2VuZCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRlbGV0ZTogKHJhbmdlKSA9PiB7XG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgaWYgKHNlcmlhbGl6ZVNpbmdsZVJhbmdlICYmIHJhbmdlIGluc3RhbmNlb2YgUmFuZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBzZXJpYWxpemVTaW5nbGVSYW5nZShidWYsIHJhbmdlKTtcbiAgICAgICAgICAgIHJldHVybiBiYWNrZW5kLmRhdGFzdG9yZURlbGV0ZUJ5SW5kZXhTY2FuUmFuZ2VCc2F0bihcbiAgICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICAgIC4uLmFyZ3NcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVNpbmdsZVBvaW50KGJ1ZiwgcmFuZ2UpO1xuICAgICAgICAgIHJldHVybiBiYWNrZW5kLmRhdGFzdG9yZURlbGV0ZUJ5SW5kZXhTY2FuUG9pbnRCc2F0bihcbiAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgIHBvaW50X2xlblxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBpZiAoaXNIYXNoSW5kZXgpIHtcbiAgICAgICAgaW5kZXggPSByYXdJbmRleDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluZGV4ID0gcmF3SW5kZXg7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc0hhc2hJbmRleCkge1xuICAgICAgaW5kZXggPSB7XG4gICAgICAgIGZpbHRlcjogKHJhbmdlKSA9PiB7XG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplUG9pbnQoYnVmLCByYW5nZSk7XG4gICAgICAgICAgY29uc3QgaXRlcl9pZCA9IGJhY2tlbmQuZGF0YXN0b3JlSW5kZXhTY2FuUG9pbnRCc2F0bihcbiAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgIHBvaW50X2xlblxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIHRhYmxlSXRlcmF0b3IoaXRlcl9pZCwgZGVzZXJpYWxpemVSb3csIGJhY2tlbmQpO1xuICAgICAgICB9LFxuICAgICAgICBkZWxldGU6IChyYW5nZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVBvaW50KGJ1ZiwgcmFuZ2UpO1xuICAgICAgICAgIHJldHVybiBiYWNrZW5kLmRhdGFzdG9yZURlbGV0ZUJ5SW5kZXhTY2FuUG9pbnRCc2F0bihcbiAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgIHBvaW50X2xlblxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGlzQ29tcGxldGVTY2FsYXJLZXkgPSAocmFuZ2UpID0+IHtcbiAgICAgICAgcmV0dXJuIHJhbmdlLmxlbmd0aCA9PT0gbnVtQ29sdW1ucyAmJiAhKHJhbmdlW3JhbmdlLmxlbmd0aCAtIDFdIGluc3RhbmNlb2YgUmFuZ2UpO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZVJhbmdlID0gKGJ1ZmZlciwgcmFuZ2UpID0+IHtcbiAgICAgICAgaWYgKHJhbmdlLmxlbmd0aCA+IG51bUNvbHVtbnMpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJ0b28gbWFueSBlbGVtZW50c1wiKTtcbiAgICAgICAgQklOQVJZX1dSSVRFUi5yZXNldChidWZmZXIpO1xuICAgICAgICBjb25zdCB3cml0ZXIgPSBCSU5BUllfV1JJVEVSO1xuICAgICAgICBjb25zdCBwcmVmaXhfZWxlbXMgPSByYW5nZS5sZW5ndGggLSAxO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWZpeF9lbGVtczsgaSsrKSB7XG4gICAgICAgICAgaW5kZXhTZXJpYWxpemVyc1tpXSh3cml0ZXIsIHJhbmdlW2ldKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByc3RhcnRPZmZzZXQgPSB3cml0ZXIub2Zmc2V0O1xuICAgICAgICBjb25zdCB0ZXJtID0gcmFuZ2VbcmFuZ2UubGVuZ3RoIC0gMV07XG4gICAgICAgIGNvbnN0IHNlcmlhbGl6ZVRlcm0gPSBpbmRleFNlcmlhbGl6ZXJzW3JhbmdlLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAodGVybSBpbnN0YW5jZW9mIFJhbmdlKSB7XG4gICAgICAgICAgY29uc3Qgd3JpdGVCb3VuZCA9IChib3VuZCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGFncyA9IHsgaW5jbHVkZWQ6IDAsIGV4Y2x1ZGVkOiAxLCB1bmJvdW5kZWQ6IDIgfTtcbiAgICAgICAgICAgIHdyaXRlci53cml0ZVU4KHRhZ3NbYm91bmQudGFnXSk7XG4gICAgICAgICAgICBpZiAoYm91bmQudGFnICE9PSBcInVuYm91bmRlZFwiKSBzZXJpYWxpemVUZXJtKHdyaXRlciwgYm91bmQudmFsdWUpO1xuICAgICAgICAgIH07XG4gICAgICAgICAgd3JpdGVCb3VuZCh0ZXJtLmZyb20pO1xuICAgICAgICAgIGNvbnN0IHJzdGFydExlbiA9IHdyaXRlci5vZmZzZXQgLSByc3RhcnRPZmZzZXQ7XG4gICAgICAgICAgd3JpdGVCb3VuZCh0ZXJtLnRvKTtcbiAgICAgICAgICBjb25zdCByZW5kTGVuID0gd3JpdGVyLm9mZnNldCAtIHJzdGFydE9mZnNldCAtIHJzdGFydExlbjtcbiAgICAgICAgICByZXR1cm4gW3JzdGFydE9mZnNldCwgcHJlZml4X2VsZW1zLCByc3RhcnRMZW4sIHJlbmRMZW5dO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdyaXRlci53cml0ZVU4KDApO1xuICAgICAgICAgIHNlcmlhbGl6ZVRlcm0od3JpdGVyLCB0ZXJtKTtcbiAgICAgICAgICBjb25zdCByc3RhcnRMZW4gPSB3cml0ZXIub2Zmc2V0IC0gcnN0YXJ0T2Zmc2V0O1xuICAgICAgICAgIGNvbnN0IHJlbmRMZW4gPSAwO1xuICAgICAgICAgIHJldHVybiBbcnN0YXJ0T2Zmc2V0LCBwcmVmaXhfZWxlbXMsIHJzdGFydExlbiwgcmVuZExlbl07XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBpbmRleCA9IHtcbiAgICAgICAgZmlsdGVyOiAocmFuZ2UpID0+IHtcbiAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocmFuZ2UpKSByYW5nZSA9IFtyYW5nZV07XG4gICAgICAgICAgaWYgKGlzQ29tcGxldGVTY2FsYXJLZXkocmFuZ2UpKSB7XG4gICAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVBvaW50KGJ1ZiwgcmFuZ2UpO1xuICAgICAgICAgICAgY29uc3QgaXRlcl9pZCA9IGJhY2tlbmQuZGF0YXN0b3JlSW5kZXhTY2FuUG9pbnRCc2F0bihcbiAgICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICAgIHBvaW50X2xlblxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiB0YWJsZUl0ZXJhdG9yKGl0ZXJfaWQsIGRlc2VyaWFsaXplUm93LCBiYWNrZW5kKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgICBjb25zdCBhcmdzID0gc2VyaWFsaXplUmFuZ2UoYnVmLCByYW5nZSk7XG4gICAgICAgICAgICBjb25zdCBpdGVyX2lkID0gYmFja2VuZC5kYXRhc3RvcmVJbmRleFNjYW5SYW5nZUJzYXRuKFxuICAgICAgICAgICAgICBpbmRleF9pZCxcbiAgICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgICAgLi4uYXJnc1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiB0YWJsZUl0ZXJhdG9yKGl0ZXJfaWQsIGRlc2VyaWFsaXplUm93LCBiYWNrZW5kKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGRlbGV0ZTogKHJhbmdlKSA9PiB7XG4gICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHJhbmdlKSkgcmFuZ2UgPSBbcmFuZ2VdO1xuICAgICAgICAgIGlmIChpc0NvbXBsZXRlU2NhbGFyS2V5KHJhbmdlKSkge1xuICAgICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgICBjb25zdCBwb2ludF9sZW4gPSBzZXJpYWxpemVQb2ludChidWYsIHJhbmdlKTtcbiAgICAgICAgICAgIHJldHVybiBiYWNrZW5kLmRhdGFzdG9yZURlbGV0ZUJ5SW5kZXhTY2FuUG9pbnRCc2F0bihcbiAgICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICAgIHBvaW50X2xlblxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgICBjb25zdCBhcmdzID0gc2VyaWFsaXplUmFuZ2UoYnVmLCByYW5nZSk7XG4gICAgICAgICAgICByZXR1cm4gYmFja2VuZC5kYXRhc3RvcmVEZWxldGVCeUluZGV4U2NhblJhbmdlQnNhdG4oXG4gICAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgICAuLi5hcmdzXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKE9iamVjdC5oYXNPd24odGFibGVWaWV3LCBhY2Nlc3Nvck5hbWUpKSB7XG4gICAgICBmcmVlemUoT2JqZWN0LmFzc2lnbih0YWJsZVZpZXdbYWNjZXNzb3JOYW1lXSwgaW5kZXgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFibGVWaWV3W2FjY2Vzc29yTmFtZV0gPSBmcmVlemUoaW5kZXgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZnJlZXplKHRhYmxlVmlldyk7XG59XG5mdW5jdGlvbiogdGFibGVJdGVyYXRvcihpZCwgZGVzZXJpYWxpemUsIGJhY2tlbmQgPSBob3N0QmFja2VuZCkge1xuICBjb25zdCBpdGVyID0gbmV3IEl0ZXJhdG9ySGFuZGxlKGlkLCBiYWNrZW5kKTtcbiAgY29uc3QgaXRlckJ1ZiA9IHRha2VCdWYoKTtcbiAgdHJ5IHtcbiAgICBsZXQgYW10O1xuICAgIHdoaWxlIChhbXQgPSBpdGVyLmFkdmFuY2UoaXRlckJ1ZikpIHtcbiAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBCaW5hcnlSZWFkZXIoaXRlckJ1Zi52aWV3KTtcbiAgICAgIHdoaWxlIChyZWFkZXIub2Zmc2V0IDwgYW10KSB7XG4gICAgICAgIHlpZWxkIGRlc2VyaWFsaXplKHJlYWRlcik7XG4gICAgICB9XG4gICAgfVxuICB9IGZpbmFsbHkge1xuICAgIGl0ZXJbU3ltYm9sLmRpc3Bvc2VdKCk7XG4gICAgcmV0dXJuQnVmKGl0ZXJCdWYpO1xuICB9XG59XG5mdW5jdGlvbiB0YWJsZUl0ZXJhdGVPbmUoaWQsIGRlc2VyaWFsaXplLCBiYWNrZW5kID0gaG9zdEJhY2tlbmQpIHtcbiAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gIGNvbnN0IHJldCA9IGFkdmFuY2VJdGVyUmF3KGlkLCBidWYsIGJhY2tlbmQpO1xuICBpZiAocmV0ICE9PSAwKSB7XG4gICAgQklOQVJZX1JFQURFUi5yZXNldChidWYudmlldyk7XG4gICAgcmV0dXJuIGRlc2VyaWFsaXplKEJJTkFSWV9SRUFERVIpO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuZnVuY3Rpb24gYWR2YW5jZUl0ZXJSYXcoaWQsIGJ1ZiwgYmFja2VuZCA9IGhvc3RCYWNrZW5kKSB7XG4gIHdoaWxlICh0cnVlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAwIHwgYmFja2VuZC5yb3dJdGVyQnNhdG5BZHZhbmNlKGlkLCBidWYuYnVmZmVyKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZSAmJiB0eXBlb2YgZSA9PT0gXCJvYmplY3RcIiAmJiBoYXNPd24oZSwgXCJfX2J1ZmZlcl90b29fc21hbGxfX1wiKSkge1xuICAgICAgICBidWYuZ3JvdyhlLl9fYnVmZmVyX3Rvb19zbWFsbF9fKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxufVxudmFyIERFRkFVTFRfQlVGRkVSX0NBUEFDSVRZID0gMzIgKiAxMDI0ICogMjtcbnZhciBJVEVSX0JVRlMgPSBbXG4gIG5ldyBSZXNpemFibGVCdWZmZXIoREVGQVVMVF9CVUZGRVJfQ0FQQUNJVFkpXG5dO1xudmFyIElURVJfQlVGX0NPVU5UID0gMTtcbmZ1bmN0aW9uIHRha2VCdWYoKSB7XG4gIHJldHVybiBJVEVSX0JVRl9DT1VOVCA/IElURVJfQlVGU1stLUlURVJfQlVGX0NPVU5UXSA6IG5ldyBSZXNpemFibGVCdWZmZXIoREVGQVVMVF9CVUZGRVJfQ0FQQUNJVFkpO1xufVxuZnVuY3Rpb24gcmV0dXJuQnVmKGJ1Zikge1xuICBJVEVSX0JVRlNbSVRFUl9CVUZfQ09VTlQrK10gPSBidWY7XG59XG52YXIgTEVBRl9CVUYgPSBuZXcgUmVzaXphYmxlQnVmZmVyKERFRkFVTFRfQlVGRkVSX0NBUEFDSVRZKTtcbnZhciBJdGVyYXRvckhhbmRsZSA9IGNsYXNzIF9JdGVyYXRvckhhbmRsZSB7XG4gICNpZDtcbiAgI2JhY2tlbmQ7XG4gIHN0YXRpYyAjZmluYWxpemF0aW9uUmVnaXN0cnkgPSBuZXcgRmluYWxpemF0aW9uUmVnaXN0cnkoKHsgaWQsIGJhY2tlbmQgfSkgPT4gYmFja2VuZC5yb3dJdGVyQnNhdG5DbG9zZShpZCkpO1xuICBjb25zdHJ1Y3RvcihpZCwgYmFja2VuZCA9IGhvc3RCYWNrZW5kKSB7XG4gICAgdGhpcy4jaWQgPSBpZDtcbiAgICB0aGlzLiNiYWNrZW5kID0gYmFja2VuZDtcbiAgICBfSXRlcmF0b3JIYW5kbGUuI2ZpbmFsaXphdGlvblJlZ2lzdHJ5LnJlZ2lzdGVyKHRoaXMsIHsgaWQsIGJhY2tlbmQgfSwgdGhpcyk7XG4gIH1cbiAgLyoqIFVucmVnaXN0ZXIgdGhpcyBvYmplY3Qgd2l0aCB0aGUgZmluYWxpemF0aW9uIHJlZ2lzdHJ5IGFuZCByZXR1cm4gdGhlIGlkICovXG4gICNkZXRhY2goKSB7XG4gICAgY29uc3QgaWQgPSB0aGlzLiNpZDtcbiAgICB0aGlzLiNpZCA9IC0xO1xuICAgIF9JdGVyYXRvckhhbmRsZS4jZmluYWxpemF0aW9uUmVnaXN0cnkudW5yZWdpc3Rlcih0aGlzKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgLyoqIENhbGwgYHJvd19pdGVyX2JzYXRuX2FkdmFuY2VgLCByZXR1cm5pbmcgMCBpZiB0aGlzIGl0ZXJhdG9yIGhhcyBiZWVuIGV4aGF1c3RlZC4gKi9cbiAgYWR2YW5jZShidWYpIHtcbiAgICBpZiAodGhpcy4jaWQgPT09IC0xKSByZXR1cm4gMDtcbiAgICBjb25zdCByZXQgPSBhZHZhbmNlSXRlclJhdyh0aGlzLiNpZCwgYnVmLCB0aGlzLiNiYWNrZW5kKTtcbiAgICBpZiAocmV0IDw9IDApIHRoaXMuI2RldGFjaCgpO1xuICAgIHJldHVybiByZXQgPCAwID8gLXJldCA6IHJldDtcbiAgfVxuICBbU3ltYm9sLmRpc3Bvc2VdKCkge1xuICAgIGlmICh0aGlzLiNpZCA+PSAwKSB7XG4gICAgICBjb25zdCBpZCA9IHRoaXMuI2RldGFjaCgpO1xuICAgICAgdGhpcy4jYmFja2VuZC5yb3dJdGVyQnNhdG5DbG9zZShpZCk7XG4gICAgfVxuICB9XG59O1xuXG4vLyBzcmMvc2VydmVyL2h0dHBfaW50ZXJuYWwudHNcbnZhciB7IGZyZWV6ZTogZnJlZXplMiB9ID0gT2JqZWN0O1xudmFyIHJlcXVlc3RCYXNlU2l6ZSA9IGJzYXRuQmFzZVNpemUoeyB0eXBlczogW10gfSwgSHR0cFJlcXVlc3QuYWxnZWJyYWljVHlwZSk7XG5mdW5jdGlvbiBmZXRjaCh1cmwsIGluaXQgPSB7fSkge1xuICBjb25zdCBtZXRob2QgPSBzZXJpYWxpemVNZXRob2QoaW5pdC5tZXRob2QpO1xuICBjb25zdCBoZWFkZXJzID0gc2VyaWFsaXplSGVhZGVycyhuZXcgSGVhZGVycyhpbml0LmhlYWRlcnMpKTtcbiAgY29uc3QgdXJpID0gXCJcIiArIHVybDtcbiAgY29uc3QgcmVxdWVzdCA9IGZyZWV6ZTIoe1xuICAgIG1ldGhvZCxcbiAgICBoZWFkZXJzLFxuICAgIHRpbWVvdXQ6IGluaXQudGltZW91dCxcbiAgICB1cmksXG4gICAgdmVyc2lvbjogeyB0YWc6IFwiSHR0cDExXCIgfVxuICB9KTtcbiAgY29uc3QgcmVxdWVzdEJ1ZiA9IG5ldyBCaW5hcnlXcml0ZXIocmVxdWVzdEJhc2VTaXplKTtcbiAgSHR0cFJlcXVlc3Quc2VyaWFsaXplKHJlcXVlc3RCdWYsIHJlcXVlc3QpO1xuICBjb25zdCBib2R5ID0gaW5pdC5ib2R5ID09IG51bGwgPyBuZXcgVWludDhBcnJheSgpIDogdHlwZW9mIGluaXQuYm9keSA9PT0gXCJzdHJpbmdcIiA/IGluaXQuYm9keSA6IG5ldyBVaW50OEFycmF5KGluaXQuYm9keSk7XG4gIGNvbnN0IFtyZXNwb25zZUJ1ZiwgcmVzcG9uc2VCb2R5XSA9IHN5czIucHJvY2VkdXJlX2h0dHBfcmVxdWVzdChcbiAgICByZXF1ZXN0QnVmLmdldEJ1ZmZlcigpLFxuICAgIGJvZHlcbiAgKTtcbiAgY29uc3QgcmVzcG9uc2UgPSBIdHRwUmVzcG9uc2UuZGVzZXJpYWxpemUobmV3IEJpbmFyeVJlYWRlcihyZXNwb25zZUJ1ZikpO1xuICByZXR1cm4gU3luY1Jlc3BvbnNlW21ha2VSZXNwb25zZV0ocmVzcG9uc2VCb2R5LCB7XG4gICAgdHlwZTogXCJiYXNpY1wiLFxuICAgIHVybDogdXJpLFxuICAgIHN0YXR1czogcmVzcG9uc2UuY29kZSxcbiAgICAvLyBgc3RhdHVzKGNvZGUpYCB0aHJvd3MgZm9yIGNvZGVzIGl0IGRvZXNuJ3Qga25vdywgbGlrZSBDbG91ZGZsYXJlJ3MgNTMwLlxuICAgIHN0YXR1c1RleHQ6IGltcG9ydF9zdGF0dXNlcy5kZWZhdWx0Lm1lc3NhZ2VbcmVzcG9uc2UuY29kZV0gPz8gXCJcIixcbiAgICBoZWFkZXJzOiBkZXNlcmlhbGl6ZUhlYWRlcnMocmVzcG9uc2UuaGVhZGVycyksXG4gICAgYWJvcnRlZDogZmFsc2UsXG4gICAgdmVyc2lvbjogcmVzcG9uc2UudmVyc2lvblxuICB9KTtcbn1cbmZyZWV6ZTIoZmV0Y2gpO1xudmFyIGh0dHBDbGllbnQgPSBmcmVlemUyKHsgZmV0Y2ggfSk7XG5cbi8vIHNyYy9zZXJ2ZXIvcHJvY2VkdXJlcy50c1xuZnVuY3Rpb24gbWFrZVByb2NlZHVyZUV4cG9ydChjdHgsIG9wdHMsIHBhcmFtcywgcmV0LCBmbikge1xuICBjb25zdCBuYW1lID0gb3B0cz8ubmFtZTtcbiAgY29uc3QgcHJvY2VkdXJlRXhwb3J0ID0gKC4uLmFyZ3MpID0+IGZuKC4uLmFyZ3MpO1xuICBwcm9jZWR1cmVFeHBvcnRbZXhwb3J0Q29udGV4dF0gPSBjdHg7XG4gIHByb2NlZHVyZUV4cG9ydFtyZWdpc3RlckV4cG9ydF0gPSAoY3R4MiwgZXhwb3J0TmFtZSkgPT4ge1xuICAgIHJlZ2lzdGVyUHJvY2VkdXJlKGN0eDIsIG5hbWUgPz8gZXhwb3J0TmFtZSwgcGFyYW1zLCByZXQsIGZuKTtcbiAgICBjdHgyLmZ1bmN0aW9uRXhwb3J0cy5zZXQoXG4gICAgICBwcm9jZWR1cmVFeHBvcnQsXG4gICAgICBuYW1lID8/IGV4cG9ydE5hbWVcbiAgICApO1xuICAgIGlmIChvcHRzPy5vblNjaGVkdWxlICE9PSB2b2lkIDApIHtcbiAgICAgIGN0eDIucGVuZGluZ1NjaGVkdWxlcy5wdXNoKHtcbiAgICAgICAgdGFibGU6IG9wdHMub25TY2hlZHVsZSxcbiAgICAgICAgZnVuY3Rpb25OYW1lOiBuYW1lID8/IGV4cG9ydE5hbWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHByb2NlZHVyZUV4cG9ydDtcbn1cbmZ1bmN0aW9uIHJlZ2lzdGVyUHJvY2VkdXJlKGN0eCwgZXhwb3J0TmFtZSwgcGFyYW1zLCByZXQsIGZuLCBvcHRzKSB7XG4gIGN0eC5kZWZpbmVGdW5jdGlvbihleHBvcnROYW1lKTtcbiAgY29uc3QgcGFyYW1zVHlwZSA9IHtcbiAgICBlbGVtZW50czogT2JqZWN0LmVudHJpZXMocGFyYW1zKS5tYXAoKFtuLCBjXSkgPT4gKHtcbiAgICAgIG5hbWU6IG4sXG4gICAgICBhbGdlYnJhaWNUeXBlOiBjdHgucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KFxuICAgICAgICBcInR5cGVCdWlsZGVyXCIgaW4gYyA/IGMudHlwZUJ1aWxkZXIgOiBjXG4gICAgICApLmFsZ2VicmFpY1R5cGVcbiAgICB9KSlcbiAgfTtcbiAgY29uc3QgcmV0dXJuVHlwZSA9IGN0eC5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkocmV0KS5hbGdlYnJhaWNUeXBlO1xuICBjdHgubW9kdWxlRGVmLnByb2NlZHVyZXMucHVzaCh7XG4gICAgc291cmNlTmFtZTogZXhwb3J0TmFtZSxcbiAgICBwYXJhbXM6IHBhcmFtc1R5cGUsXG4gICAgcmV0dXJuVHlwZSxcbiAgICB2aXNpYmlsaXR5OiBGdW5jdGlvblZpc2liaWxpdHkuQ2xpZW50Q2FsbGFibGVcbiAgfSk7XG4gIGNvbnN0IHsgdHlwZXNwYWNlIH0gPSBjdHg7XG4gIGN0eC5wcm9jZWR1cmVzLnB1c2goe1xuICAgIGZuLFxuICAgIGRlc2VyaWFsaXplQXJnczogUHJvZHVjdFR5cGUubWFrZURlc2VyaWFsaXplcihwYXJhbXNUeXBlLCB0eXBlc3BhY2UpLFxuICAgIHNlcmlhbGl6ZVJldHVybjogQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihyZXR1cm5UeXBlLCB0eXBlc3BhY2UpLFxuICAgIHJldHVyblR5cGVCYXNlU2l6ZTogYnNhdG5CYXNlU2l6ZSh0eXBlc3BhY2UsIHJldHVyblR5cGUpXG4gIH0pO1xufVxuZnVuY3Rpb24gY2FsbFByb2NlZHVyZShwcm9jZWR1cmVzLCBpZCwgc2VuZGVyLCBjb25uZWN0aW9uSWQsIHRpbWVzdGFtcCwgYXJnc0J1ZiwgZGJWaWV3LCBkaXNwYXRjaGVzID0gW10sIHBhcmVudFByZWZpeCA9IFwiXCIpIHtcbiAgY29uc3QgeyBmbiwgZGVzZXJpYWxpemVBcmdzLCBzZXJpYWxpemVSZXR1cm4sIHJldHVyblR5cGVCYXNlU2l6ZSB9ID0gcHJvY2VkdXJlc1tpZF07XG4gIGNvbnN0IGFyZ3MgPSBkZXNlcmlhbGl6ZUFyZ3MobmV3IEJpbmFyeVJlYWRlcihhcmdzQnVmKSk7XG4gIGNvbnN0IGN0eCA9IG5ldyBQcm9jZWR1cmVDdHhJbXBsKFxuICAgIHNlbmRlcixcbiAgICB0aW1lc3RhbXAsXG4gICAgY29ubmVjdGlvbklkLFxuICAgIGRiVmlldyxcbiAgICBob3N0QmFja2VuZCxcbiAgICBodHRwQ2xpZW50LFxuICAgIHZvaWQgMCxcbiAgICB2b2lkIDAsXG4gICAgdm9pZCAwLFxuICAgIGRpc3BhdGNoZXMsXG4gICAgcGFyZW50UHJlZml4XG4gICk7XG4gIGNvbnN0IHJldCA9IGNhbGxVc2VyRnVuY3Rpb24oZm4sIGN0eCwgYXJncyk7XG4gIGNvbnN0IHJldEJ1ZiA9IG5ldyBCaW5hcnlXcml0ZXIocmV0dXJuVHlwZUJhc2VTaXplKTtcbiAgc2VyaWFsaXplUmV0dXJuKHJldEJ1ZiwgcmV0KTtcbiAgcmV0dXJuIHJldEJ1Zi5nZXRCdWZmZXIoKTtcbn1cbnZhciBQcm9jZWR1cmVDdHhJbXBsID0gY2xhc3MgUHJvY2VkdXJlQ3R4IHtcbiAgY29uc3RydWN0b3Ioc2VuZGVyLCB0aW1lc3RhbXAsIGNvbm5lY3Rpb25JZCwgZGJWaWV3LCBiYWNrZW5kID0gaG9zdEJhY2tlbmQsIGh0dHAgPSBodHRwQ2xpZW50LCBzbGVlcCA9ICgpID0+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJwcm9jZWR1cmUgc2xlZXAgaXMgbm90IGF2YWlsYWJsZSBpbiB0aGlzIHJ1bnRpbWVcIik7XG4gIH0sIHJhbmRvbSwgY2hpbGRTZWVkUmFuZG9tLCBkaXNwYXRjaGVzID0gW10sIHBhcmVudFByZWZpeCA9IFwiXCIpIHtcbiAgICB0aGlzLnNlbmRlciA9IHNlbmRlcjtcbiAgICB0aGlzLnRpbWVzdGFtcCA9IHRpbWVzdGFtcDtcbiAgICB0aGlzLmNvbm5lY3Rpb25JZCA9IGNvbm5lY3Rpb25JZDtcbiAgICB0aGlzLiNkYlZpZXcgPSBkYlZpZXc7XG4gICAgdGhpcy4jYmFja2VuZCA9IGJhY2tlbmQ7XG4gICAgdGhpcy4jaHR0cCA9IGh0dHA7XG4gICAgdGhpcy4jc2xlZXAgPSBzbGVlcDtcbiAgICB0aGlzLiNyYW5kb20gPSByYW5kb207XG4gICAgdGhpcy4jY2hpbGRTZWVkUmFuZG9tID0gY2hpbGRTZWVkUmFuZG9tO1xuICAgIHRoaXMuI2Rpc3BhdGNoZXMgPSBkaXNwYXRjaGVzO1xuICAgIHRoaXMuI3BhcmVudFByZWZpeCA9IHBhcmVudFByZWZpeDtcbiAgfVxuICAjaWRlbnRpdHk7XG4gICN1dWlkQ291bnRlcjtcbiAgI3JhbmRvbTtcbiAgI2RiVmlldztcbiAgI2JhY2tlbmQ7XG4gICNodHRwO1xuICAjc2xlZXA7XG4gICNjaGlsZFNlZWRSYW5kb207XG4gIGVudiA9IGVudmlyb25tZW50O1xuICAjZGlzcGF0Y2hlcztcbiAgI3BhcmVudFByZWZpeDtcbiAgI2FzVmlld3M7XG4gIGdldCBkYXRhYmFzZUlkZW50aXR5KCkge1xuICAgIHJldHVybiB0aGlzLiNpZGVudGl0eSA/Pz0gbmV3IElkZW50aXR5KHRoaXMuI2JhY2tlbmQuaWRlbnRpdHkoKSk7XG4gIH1cbiAgZ2V0IGlkZW50aXR5KCkge1xuICAgIHJldHVybiB0aGlzLmRhdGFiYXNlSWRlbnRpdHk7XG4gIH1cbiAgZ2V0IHJhbmRvbSgpIHtcbiAgICByZXR1cm4gdGhpcy4jcmFuZG9tID8/PSBtYWtlUmFuZG9tKHRoaXMudGltZXN0YW1wKTtcbiAgfVxuICBnZXQgaHR0cCgpIHtcbiAgICByZXR1cm4gdGhpcy4jaHR0cDtcbiAgfVxuICBzbGVlcChkdXJhdGlvbikge1xuICAgIHRoaXMuI3NsZWVwKGR1cmF0aW9uKTtcbiAgfVxuICBnZXQgYXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2FzVmlld3MgPz89IGJ1aWxkUHJvY2VkdXJlQWxpYXNDdHhNYXAoXG4gICAgICB0aGlzLFxuICAgICAgdGhpcy4jZGlzcGF0Y2hlcyxcbiAgICAgIHRoaXMuI3BhcmVudFByZWZpeFxuICAgICk7XG4gIH1cbiAgd2l0aFR4KGJvZHkpIHtcbiAgICBjb25zdCB0eFNlZWQgPSB0aGlzLiNjaGlsZFNlZWRSYW5kb20/LmJpZ2ludEluUmFuZ2UoMG4sICgxbiA8PCA2NG4pIC0gMW4pO1xuICAgIGNvbnN0IGRpc3BhdGNoZXMgPSB0aGlzLiNkaXNwYXRjaGVzO1xuICAgIGNvbnN0IHBhcmVudFByZWZpeCA9IHRoaXMuI3BhcmVudFByZWZpeDtcbiAgICByZXR1cm4gcnVuV2l0aFR4KFxuICAgICAgKHRpbWVzdGFtcCkgPT4ge1xuICAgICAgICBjb25zdCB0eCA9IG5ldyBSZWR1Y2VyQ3R4SW1wbChcbiAgICAgICAgICB0aGlzLnNlbmRlcixcbiAgICAgICAgICB0aW1lc3RhbXAsXG4gICAgICAgICAgdGhpcy5jb25uZWN0aW9uSWQsXG4gICAgICAgICAgdGhpcy4jZGJWaWV3KCksXG4gICAgICAgICAgdGhpcy4jYmFja2VuZCxcbiAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgdHhTZWVkID09IG51bGwgPyB2b2lkIDAgOiBtYWtlUmFuZG9tRnJvbVNlZWQodHhTZWVkKVxuICAgICAgICApO1xuICAgICAgICBhc3NpZ25UeEFsaWFzVmlld3ModHgsIGRpc3BhdGNoZXMsIHBhcmVudFByZWZpeCk7XG4gICAgICAgIHJldHVybiB0eDtcbiAgICAgIH0sXG4gICAgICBib2R5LFxuICAgICAgdGhpcy4jYmFja2VuZFxuICAgICk7XG4gIH1cbiAgbmV3VXVpZFY0KCkge1xuICAgIGNvbnN0IGJ5dGVzID0gdGhpcy5yYW5kb20uZmlsbChuZXcgVWludDhBcnJheSgxNikpO1xuICAgIHJldHVybiBVdWlkLmZyb21SYW5kb21CeXRlc1Y0KGJ5dGVzKTtcbiAgfVxuICBuZXdVdWlkVjcoKSB7XG4gICAgY29uc3QgYnl0ZXMgPSB0aGlzLnJhbmRvbS5maWxsKG5ldyBVaW50OEFycmF5KDQpKTtcbiAgICBjb25zdCBjb3VudGVyID0gdGhpcy4jdXVpZENvdW50ZXIgPz89IHsgdmFsdWU6IDAgfTtcbiAgICByZXR1cm4gVXVpZC5mcm9tQ291bnRlclY3KGNvdW50ZXIsIHRoaXMudGltZXN0YW1wLCBieXRlcyk7XG4gIH1cbn07XG5cbi8vIHNyYy9zZXJ2ZXIvcmVkdWNlcnMudHNcbmZ1bmN0aW9uIG1ha2VSZWR1Y2VyRXhwb3J0KGN0eCwgb3B0cywgcGFyYW1zLCBmbiwgbGlmZWN5Y2xlKSB7XG4gIGNvbnN0IHJlZHVjZXJFeHBvcnQgPSAoLi4uYXJncykgPT4gZm4oLi4uYXJncyk7XG4gIHJlZHVjZXJFeHBvcnRbZXhwb3J0Q29udGV4dF0gPSBjdHg7XG4gIHJlZHVjZXJFeHBvcnRbcmVnaXN0ZXJFeHBvcnRdID0gKGN0eDIsIGV4cG9ydE5hbWUpID0+IHtcbiAgICByZWdpc3RlclJlZHVjZXIoY3R4MiwgZXhwb3J0TmFtZSwgcGFyYW1zLCBmbiwgb3B0cywgbGlmZWN5Y2xlKTtcbiAgICBjdHgyLmZ1bmN0aW9uRXhwb3J0cy5zZXQoXG4gICAgICByZWR1Y2VyRXhwb3J0LFxuICAgICAgZXhwb3J0TmFtZVxuICAgICk7XG4gICAgaWYgKG9wdHM/Lm9uU2NoZWR1bGUgIT09IHZvaWQgMCkge1xuICAgICAgY3R4Mi5wZW5kaW5nU2NoZWR1bGVzLnB1c2goe1xuICAgICAgICB0YWJsZTogb3B0cy5vblNjaGVkdWxlLFxuICAgICAgICBmdW5jdGlvbk5hbWU6IGV4cG9ydE5hbWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHJlZHVjZXJFeHBvcnQ7XG59XG5mdW5jdGlvbiByZWdpc3RlclJlZHVjZXIoY3R4LCBleHBvcnROYW1lLCBwYXJhbXMsIGZuLCBvcHRzLCBsaWZlY3ljbGUpIHtcbiAgY3R4LmRlZmluZUZ1bmN0aW9uKGV4cG9ydE5hbWUpO1xuICBpZiAoIShwYXJhbXMgaW5zdGFuY2VvZiBSb3dCdWlsZGVyKSkge1xuICAgIHBhcmFtcyA9IG5ldyBSb3dCdWlsZGVyKHBhcmFtcyk7XG4gIH1cbiAgaWYgKHBhcmFtcy50eXBlTmFtZSA9PT0gdm9pZCAwKSB7XG4gICAgcGFyYW1zLnR5cGVOYW1lID0gdG9QYXNjYWxDYXNlKGV4cG9ydE5hbWUpO1xuICB9XG4gIGNvbnN0IHJlZiA9IGN0eC5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkocGFyYW1zKTtcbiAgY29uc3QgcGFyYW1zVHlwZSA9IGN0eC5yZXNvbHZlVHlwZShyZWYpLnZhbHVlO1xuICBjb25zdCBpc0xpZmVjeWNsZSA9IGxpZmVjeWNsZSAhPSBudWxsO1xuICBjdHgubW9kdWxlRGVmLnJlZHVjZXJzLnB1c2goe1xuICAgIHNvdXJjZU5hbWU6IGV4cG9ydE5hbWUsXG4gICAgcGFyYW1zOiBwYXJhbXNUeXBlLFxuICAgIC8vTW9kdWxlRGVmIHZhbGlkYXRpb24gY29kZSBpcyByZXNwb25zaWJsZSB0byBtYXJrIHByaXZhdGUgcmVkdWNlcnNcbiAgICB2aXNpYmlsaXR5OiBGdW5jdGlvblZpc2liaWxpdHkuQ2xpZW50Q2FsbGFibGUsXG4gICAgLy9IYXJkY29kZWQgZm9yIG5vdyAtIHJlZHVjZXJzIGRvIG5vdCByZXR1cm4gdmFsdWVzIHlldFxuICAgIG9rUmV0dXJuVHlwZTogQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHsgZWxlbWVudHM6IFtdIH0pLFxuICAgIGVyclJldHVyblR5cGU6IEFsZ2VicmFpY1R5cGUuU3RyaW5nXG4gIH0pO1xuICBpZiAob3B0cz8ubmFtZSAhPSBudWxsKSB7XG4gICAgY3R4Lm1vZHVsZURlZi5leHBsaWNpdE5hbWVzLmVudHJpZXMucHVzaCh7XG4gICAgICB0YWc6IFwiRnVuY3Rpb25cIixcbiAgICAgIHZhbHVlOiB7XG4gICAgICAgIHNvdXJjZU5hbWU6IGV4cG9ydE5hbWUsXG4gICAgICAgIGNhbm9uaWNhbE5hbWU6IG9wdHMubmFtZVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGlmIChpc0xpZmVjeWNsZSkge1xuICAgIGN0eC5tb2R1bGVEZWYubGlmZUN5Y2xlUmVkdWNlcnMucHVzaCh7XG4gICAgICBsaWZlY3ljbGVTcGVjOiBsaWZlY3ljbGUsXG4gICAgICBmdW5jdGlvbk5hbWU6IGV4cG9ydE5hbWVcbiAgICB9KTtcbiAgfVxuICBpZiAoIWZuLm5hbWUpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZm4sIFwibmFtZVwiLCB7IHZhbHVlOiBleHBvcnROYW1lLCB3cml0YWJsZTogZmFsc2UgfSk7XG4gIH1cbiAgY3R4LnJlZHVjZXJzLnB1c2goZm4pO1xufVxuXG4vLyBzcmMvc2VydmVyL3NjaGVtYS50c1xudmFyIFNjaGVtYUlubmVyID0gY2xhc3MgZXh0ZW5kcyBNb2R1bGVDb250ZXh0IHtcbiAgc2NoZW1hVHlwZTtcbiAgZXhwb3J0c1JlZ2lzdGVyZWQgPSBmYWxzZTtcbiAgc2NoZWR1bGVzUmVzb2x2ZWQgPSBmYWxzZTtcbiAgZXhpc3RpbmdGdW5jdGlvbnMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xuICBleGlzdGluZ0h0dHBIYW5kbGVycyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gIHJlZHVjZXJzID0gW107XG4gIHByb2NlZHVyZXMgPSBbXTtcbiAgdmlld3MgPSBbXTtcbiAgYW5vblZpZXdzID0gW107XG4gIGh0dHBIYW5kbGVycyA9IFtdO1xuICAvKipcbiAgICogTWFwcyByZWR1Y2VyL3Byb2NlZHVyZSBleHBvcnQgb2JqZWN0cyB0byB0aGVpciBzb3VyY2UgbmFtZXMuXG4gICAqIFVzZWQgZm9yIHJlc29sdmluZyBzY2hlZHVsZWQgdGFibGUgdGFyZ2V0cy5cbiAgICovXG4gIGZ1bmN0aW9uRXhwb3J0cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIHRhYmxlU291cmNlTmFtZXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICBodHRwSGFuZGxlckV4cG9ydHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICBwZW5kaW5nU2NoZWR1bGVzID0gW107XG4gIHBlbmRpbmdIdHRwUm91dGVzID0gW107XG4gIHN1Ym1vZHVsZURpc3BhdGNoSW5mb3MgPSBbXTtcbiAgY29uc3RydWN0b3IoZ2V0U2NoZW1hVHlwZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zY2hlbWFUeXBlID0gZ2V0U2NoZW1hVHlwZSh0aGlzKTtcbiAgfVxuICBkZWZpbmVGdW5jdGlvbihuYW1lKSB7XG4gICAgaWYgKHRoaXMuZXhpc3RpbmdGdW5jdGlvbnMuaGFzKG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICBgVGhlcmUgaXMgYWxyZWFkeSBhIHJlZHVjZXIsIHByb2NlZHVyZSwgb3IgdmlldyB3aXRoIHRoZSBuYW1lICcke25hbWV9J2BcbiAgICAgICk7XG4gICAgfVxuICAgIHRoaXMuZXhpc3RpbmdGdW5jdGlvbnMuYWRkKG5hbWUpO1xuICB9XG4gIGRlZmluZUh0dHBIYW5kbGVyKG5hbWUpIHtcbiAgICBpZiAodGhpcy5leGlzdGluZ0h0dHBIYW5kbGVycy5oYXMobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgIGBUaGVyZSBpcyBhbHJlYWR5IGFuIEhUVFAgaGFuZGxlciB3aXRoIHRoZSBuYW1lICcke25hbWV9J2BcbiAgICAgICk7XG4gICAgfVxuICAgIHRoaXMuZXhpc3RpbmdIdHRwSGFuZGxlcnMuYWRkKG5hbWUpO1xuICB9XG4gIHJlc29sdmVTY2hlZHVsZXMoKSB7XG4gICAgaWYgKHRoaXMuc2NoZWR1bGVzUmVzb2x2ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zY2hlZHVsZXNSZXNvbHZlZCA9IHRydWU7XG4gICAgY29uc3Qgc2NoZWR1bGVkVGFibGVzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IHtcbiAgICAgIGZ1bmN0aW9uTmFtZToga25vd25GdW5jdGlvbk5hbWUsXG4gICAgICByZWR1Y2VyLFxuICAgICAgdGFibGU6IHRhYmxlMixcbiAgICAgIHRhYmxlTmFtZToga25vd25UYWJsZU5hbWUsXG4gICAgICBzY2hlZHVsZUF0Q29sOiBrbm93blNjaGVkdWxlQXRDb2xcbiAgICB9IG9mIHRoaXMucGVuZGluZ1NjaGVkdWxlcykge1xuICAgICAgbGV0IHRhYmxlTmFtZSA9IGtub3duVGFibGVOYW1lO1xuICAgICAgaWYgKHRhYmxlTmFtZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGNvbnN0IHRhYmxlTmFtZXMgPSB0aGlzLnRhYmxlU291cmNlTmFtZXMuZ2V0KHRhYmxlMik7XG4gICAgICAgIGlmICh0YWJsZU5hbWVzICE9PSB2b2lkIDAgJiYgdGFibGVOYW1lcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgIFwiU2NoZWR1bGUgdGFyZ2V0IHRhYmxlIGlzIHJlZ2lzdGVyZWQgbW9yZSB0aGFuIG9uY2UgaW4gdGhpcyBzY2hlbWEuIFVzZSBhIGRpc3RpbmN0IHRhYmxlIGhhbmRsZSBmb3IgZWFjaCBzY2hlZHVsZWQgdGFibGUuXCJcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHRhYmxlTmFtZSA9IHRhYmxlTmFtZXM/LlswXTtcbiAgICAgIH1cbiAgICAgIGlmICh0YWJsZU5hbWUgPT09IHZvaWQgMCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIFwiU2NoZWR1bGUgdGFyZ2V0IHRhYmxlIGlzIG5vdCBwYXJ0IG9mIHRoaXMgc2NoZW1hLlwiXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBjb25zdCBzY2hlZHVsZUF0Q29sID0ga25vd25TY2hlZHVsZUF0Q29sID8/IHRhYmxlMi5zY2hlZHVsZUF0Q29sO1xuICAgICAgaWYgKHNjaGVkdWxlQXRDb2wgPT09IHZvaWQgMCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIGBUYWJsZSAke3RhYmxlTmFtZX0gZGVmaW5lcyBhIHNjaGVkdWxlLCBidXQgaXQgZG9lcyBub3QgaGF2ZSBhIFNjaGVkdWxlQXQgY29sdW1uLmBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGZ1bmN0aW9uTmFtZSA9IGtub3duRnVuY3Rpb25OYW1lID8/IChyZWR1Y2VyID09PSB2b2lkIDAgPyB2b2lkIDAgOiB0aGlzLmZ1bmN0aW9uRXhwb3J0cy5nZXQocmVkdWNlcigpKSk7XG4gICAgICBpZiAoZnVuY3Rpb25OYW1lID09PSB2b2lkIDApIHtcbiAgICAgICAgY29uc3QgbXNnID0gYFRhYmxlICR7dGFibGVOYW1lfSBkZWZpbmVzIGEgc2NoZWR1bGUsIGJ1dCBpdCBzZWVtcyBsaWtlIHRoZSBhc3NvY2lhdGVkIGZ1bmN0aW9uIHdhcyBub3QgZXhwb3J0ZWQuYDtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgY29uc3QgZXhpc3RpbmdGdW5jdGlvbk5hbWUgPSBzY2hlZHVsZWRUYWJsZXMuZ2V0KHRhYmxlTmFtZSk7XG4gICAgICBpZiAoZXhpc3RpbmdGdW5jdGlvbk5hbWUgIT09IHZvaWQgMCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIGBUYWJsZSAke3RhYmxlTmFtZX0gZGVmaW5lcyBtdWx0aXBsZSBzY2hlZHVsZXM6ICR7ZXhpc3RpbmdGdW5jdGlvbk5hbWV9IGFuZCAke2Z1bmN0aW9uTmFtZX0uIEEgc2NoZWR1bGUgdGFibGUgY2FuIG9ubHkgYmUgdXNlZCBieSBvbmUgcmVkdWNlciBvciBwcm9jZWR1cmUuYFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgc2NoZWR1bGVkVGFibGVzLnNldCh0YWJsZU5hbWUsIGZ1bmN0aW9uTmFtZSk7XG4gICAgICB0aGlzLm1vZHVsZURlZi5zY2hlZHVsZXMucHVzaCh7XG4gICAgICAgIHNvdXJjZU5hbWU6IHZvaWQgMCxcbiAgICAgICAgdGFibGVOYW1lLFxuICAgICAgICBzY2hlZHVsZUF0Q29sLFxuICAgICAgICBmdW5jdGlvbk5hbWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICByZXNvbHZlSHR0cFJvdXRlcygpIHtcbiAgICBmb3IgKGNvbnN0IHJvdXRlIG9mIHRoaXMucGVuZGluZ0h0dHBSb3V0ZXMpIHtcbiAgICAgIGNvbnN0IGhhbmRsZXJGdW5jdGlvbiA9IHRoaXMuaHR0cEhhbmRsZXJFeHBvcnRzLmdldChyb3V0ZS5oYW5kbGVyKTtcbiAgICAgIGlmIChoYW5kbGVyRnVuY3Rpb24gPT09IHZvaWQgMCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIGBIVFRQIHJvdXRlIGZvciBwYXRoICcke3JvdXRlLnBhdGh9JyByZWZlcnMgdG8gYSBoYW5kbGVyIHRoYXQgd2FzIG5vdCBleHBvcnRlZC5gXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLm1vZHVsZURlZi5odHRwUm91dGVzLnB1c2goe1xuICAgICAgICBoYW5kbGVyRnVuY3Rpb24sXG4gICAgICAgIG1ldGhvZDogcm91dGUubWV0aG9kLFxuICAgICAgICBwYXRoOiByb3V0ZS5wYXRoXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn07XG52YXIgU2NoZW1hID0gY2xhc3Mge1xuICAjY3R4O1xuICBjb25zdHJ1Y3RvcihjdHgpIHtcbiAgICB0aGlzLiNjdHggPSBjdHg7XG4gIH1cbiAgW21vZHVsZUhvb2tzXShleHBvcnRzKSB7XG4gICAgdGhpcy5idWlsZFJhd01vZHVsZURlZlYxMChleHBvcnRzKTtcbiAgICB0aGlzLiNjdHgucmVzb2x2ZUh0dHBSb3V0ZXMoKTtcbiAgICByZXR1cm4gbWFrZUhvb2tzKHRoaXMuI2N0eCk7XG4gIH1cbiAgZ2V0IHNjaGVtYVR5cGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2N0eC5zY2hlbWFUeXBlO1xuICB9XG4gIGdldCBtb2R1bGVEZWYoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2N0eC5tb2R1bGVEZWY7XG4gIH1cbiAgZ2V0IHR5cGVzcGFjZSgpIHtcbiAgICByZXR1cm4gdGhpcy4jY3R4LnR5cGVzcGFjZTtcbiAgfVxuICBnZXQgc3VibW9kdWxlRGlzcGF0Y2hJbmZvcygpIHtcbiAgICByZXR1cm4gdGhpcy4jY3R4LnN1Ym1vZHVsZURpc3BhdGNoSW5mb3M7XG4gIH1cbiAgLyoqIEludGVybmFsOiByZWdpc3RlciBleHBvcnRzIGFuZCBtYXRlcmlhbGl6ZSB0aGUgUmF3TW9kdWxlRGVmVjEwIGZvciB1cGxvYWQuICovXG4gIGJ1aWxkUmF3TW9kdWxlRGVmVjEwKGV4cG9ydHMsIG9wdHMpIHtcbiAgICByZWdpc3Rlck1vZHVsZUV4cG9ydHModGhpcy4jY3R4LCBleHBvcnRzLCB7XG4gICAgICBpZ25vcmVOb25Nb2R1bGVFeHBvcnRzOiBvcHRzPy5pZ25vcmVOb25Nb2R1bGVFeHBvcnRzID8/IGZhbHNlXG4gICAgfSk7XG4gICAgdGhpcy4jY3R4LnJlc29sdmVTY2hlZHVsZXMoKTtcbiAgICByZXR1cm4gdGhpcy4jY3R4LnJhd01vZHVsZURlZlYxMCgpO1xuICB9XG4gIC8qKlxuICAgKiBAaW50ZXJuYWwg4oCTIGNhbGxlZCBieSBzY2hlbWEoKSB3aGVuIHByb2Nlc3NpbmcgYSBzdWJtb2R1bGUgbmFtZXNwYWNlIGVudHJ5LlxuICAgKiBSZWdpc3RlcnMgdGhlIGxpYnJhcnkncyBleHBvcnRzIGFuZCByZXR1cm5zIGJvdGggdGhlIHNlcmlhbGl6ZWQgbW9kdWxlIGRlZlxuICAgKiBhbmQgdGhlIHJ1bnRpbWUgZGlzcGF0Y2ggaW5mbyBuZWVkZWQgYnkgTW9kdWxlSG9va3NJbXBsIGZvciBfX2NhbGxfcmVkdWNlcl9fLlxuICAgKi9cbiAgYnVpbGRTdWJtb2R1bGVEaXNwYXRjaChleHBvcnRzKSB7XG4gICAgY29uc3QgcmF3RGVmID0gdGhpcy5idWlsZFJhd01vZHVsZURlZlYxMChleHBvcnRzLCB7XG4gICAgICBpZ25vcmVOb25Nb2R1bGVFeHBvcnRzOiB0cnVlXG4gICAgfSk7XG4gICAgaWYgKHRoaXMuI2N0eC5tb2R1bGVEZWYuZW52aXJvbm1lbnQubGVuZ3RoICE9PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VibW9kdWxlcyBjYW5ub3QgZGVjbGFyZSBlbnZpcm9ubWVudCB2YXJpYWJsZXNcIik7XG4gICAgfVxuICAgIHRoaXMuI2N0eC5yZXNvbHZlSHR0cFJvdXRlcygpO1xuICAgIHJldHVybiB7XG4gICAgICByYXdEZWYsXG4gICAgICBkaXNwYXRjaDoge1xuICAgICAgICBuYW1lc3BhY2U6IFwiXCIsXG4gICAgICAgIHJlZHVjZXJGbnM6IFsuLi50aGlzLiNjdHgucmVkdWNlcnNdLFxuICAgICAgICByZWR1Y2VyRGVmczogWy4uLnRoaXMuI2N0eC5tb2R1bGVEZWYucmVkdWNlcnNdLFxuICAgICAgICBwcm9jZWR1cmVGbnM6IFsuLi50aGlzLiNjdHgucHJvY2VkdXJlc10sXG4gICAgICAgIHByb2NlZHVyZURlZnM6IFsuLi50aGlzLiNjdHgubW9kdWxlRGVmLnByb2NlZHVyZXNdLFxuICAgICAgICBhbm9uVmlld0ZuczogWy4uLnRoaXMuI2N0eC5hbm9uVmlld3NdLFxuICAgICAgICB2aWV3Rm5zOiBbLi4udGhpcy4jY3R4LnZpZXdzXSxcbiAgICAgICAgdHlwZXNwYWNlOiB0aGlzLiNjdHgubW9kdWxlRGVmLnR5cGVzcGFjZSxcbiAgICAgICAgdGFibGVzOiBPYmplY3QudmFsdWVzKHRoaXMuI2N0eC5zY2hlbWFUeXBlLnRhYmxlcykubWFwKCh0MikgPT4gKHtcbiAgICAgICAgICBhY2Nlc3Nvck5hbWU6IHQyLmFjY2Vzc29yTmFtZSxcbiAgICAgICAgICB0YWJsZURlZjogdDIudGFibGVEZWZcbiAgICAgICAgfSkpLFxuICAgICAgICBzY2hlbWFUYWJsZXM6IHRoaXMuI2N0eC5zY2hlbWFUeXBlLnRhYmxlcyxcbiAgICAgICAgc3ViRGlzcGF0Y2hlczogWy4uLnRoaXMuI2N0eC5zdWJtb2R1bGVEaXNwYXRjaEluZm9zXVxuICAgICAgfVxuICAgIH07XG4gIH1cbiAgcmVkdWNlciguLi5hcmdzKSB7XG4gICAgbGV0IG9wdHMsIHBhcmFtcyA9IHt9LCBmbjtcbiAgICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIFtmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjoge1xuICAgICAgICBsZXQgYXJnMTtcbiAgICAgICAgW2FyZzEsIGZuXSA9IGFyZ3M7XG4gICAgICAgIGlmICh0eXBlb2YgYXJnMS5uYW1lID09PSBcInN0cmluZ1wiKVxuICAgICAgICAgIG9wdHMgPSBhcmcxO1xuICAgICAgICBlbHNlIHBhcmFtcyA9IGFyZzE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAzOlxuICAgICAgICBbb3B0cywgcGFyYW1zLCBmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIG1ha2VSZWR1Y2VyRXhwb3J0KHRoaXMuI2N0eCwgb3B0cywgcGFyYW1zLCBmbik7XG4gIH1cbiAgaW5pdCguLi5hcmdzKSB7XG4gICAgbGV0IG9wdHMsIGZuO1xuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgW2ZuXSA9IGFyZ3M7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBbb3B0cywgZm5dID0gYXJncztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBtYWtlUmVkdWNlckV4cG9ydCh0aGlzLiNjdHgsIG9wdHMsIHt9LCBmbiwgTGlmZWN5Y2xlLkluaXQpO1xuICB9XG4gIGNsaWVudENvbm5lY3RlZCguLi5hcmdzKSB7XG4gICAgbGV0IG9wdHMsIGZuO1xuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgW2ZuXSA9IGFyZ3M7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBbb3B0cywgZm5dID0gYXJncztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBtYWtlUmVkdWNlckV4cG9ydCh0aGlzLiNjdHgsIG9wdHMsIHt9LCBmbiwgTGlmZWN5Y2xlLk9uQ29ubmVjdCk7XG4gIH1cbiAgY2xpZW50RGlzY29ubmVjdGVkKC4uLmFyZ3MpIHtcbiAgICBsZXQgb3B0cywgZm47XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBbZm5dID0gYXJncztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIFtvcHRzLCBmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIG1ha2VSZWR1Y2VyRXhwb3J0KHRoaXMuI2N0eCwgb3B0cywge30sIGZuLCBMaWZlY3ljbGUuT25EaXNjb25uZWN0KTtcbiAgfVxuICB2aWV3KG9wdHMsIC4uLmFyZ3MpIHtcbiAgICBsZXQgcGFyYW1zID0ge30sIHJldCwgZm47XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAyOlxuICAgICAgICBbcmV0LCBmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgW3BhcmFtcywgcmV0LCBmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIG1ha2VWaWV3RXhwb3J0KHRoaXMuI2N0eCwgb3B0cywgcGFyYW1zLCByZXQsIGZuKTtcbiAgfVxuICBhbm9ueW1vdXNWaWV3KG9wdHMsIC4uLmFyZ3MpIHtcbiAgICBsZXQgcGFyYW1zID0ge30sIHJldCwgZm47XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAyOlxuICAgICAgICBbcmV0LCBmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgW3BhcmFtcywgcmV0LCBmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIG1ha2VBbm9uVmlld0V4cG9ydChcbiAgICAgIHRoaXMuI2N0eCxcbiAgICAgIG9wdHMsXG4gICAgICBwYXJhbXMsXG4gICAgICByZXQsXG4gICAgICBmblxuICAgICk7XG4gIH1cbiAgcHJvY2VkdXJlKC4uLmFyZ3MpIHtcbiAgICBsZXQgb3B0cywgcGFyYW1zID0ge30sIHJldCwgZm47XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAyOlxuICAgICAgICBbcmV0LCBmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzoge1xuICAgICAgICBsZXQgYXJnMTtcbiAgICAgICAgW2FyZzEsIHJldCwgZm5dID0gYXJncztcbiAgICAgICAgaWYgKHR5cGVvZiBhcmcxLm5hbWUgPT09IFwic3RyaW5nXCIpXG4gICAgICAgICAgb3B0cyA9IGFyZzE7XG4gICAgICAgIGVsc2UgcGFyYW1zID0gYXJnMTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIDQ6XG4gICAgICAgIFtvcHRzLCBwYXJhbXMsIHJldCwgZm5dID0gYXJncztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBtYWtlUHJvY2VkdXJlRXhwb3J0KHRoaXMuI2N0eCwgb3B0cywgcGFyYW1zLCByZXQsIGZuKTtcbiAgfVxuICBodHRwSGFuZGxlciguLi5hcmdzKSB7XG4gICAgbGV0IG9wdHMsIGZuO1xuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgW2ZuXSA9IGFyZ3M7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBbb3B0cywgZm5dID0gYXJncztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBtYWtlSHR0cEhhbmRsZXJFeHBvcnQodGhpcy4jY3R4LCBvcHRzLCBmbik7XG4gIH1cbiAgaHR0cFJvdXRlcihyb3V0ZXIpIHtcbiAgICByZXR1cm4gbWFrZUh0dHBSb3V0ZXJFeHBvcnQodGhpcy4jY3R4LCByb3V0ZXIpO1xuICB9XG4gIC8qKlxuICAgKiBCdW5kbGUgbXVsdGlwbGUgcmVkdWNlcnMsIHByb2NlZHVyZXMsIGV0YyBpbnRvIG9uZSB2YWx1ZSB0byBleHBvcnQuXG4gICAqIFRoZSBuYW1lIHRoZXkgd2lsbCBiZSBleHBvcnRlZCB3aXRoIGlzIHRoZWlyIGNvcnJlc3BvbmRpbmcga2V5IGluIHRoZSBgZXhwb3J0c2AgYXJndW1lbnQuXG4gICAqL1xuICBleHBvcnRHcm91cChleHBvcnRzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIFtleHBvcnRDb250ZXh0XTogdGhpcy4jY3R4LFxuICAgICAgW3JlZ2lzdGVyRXhwb3J0XShjdHgsIF9leHBvcnROYW1lKSB7XG4gICAgICAgIGZvciAoY29uc3QgW2V4cG9ydE5hbWUsIG1vZHVsZUV4cG9ydF0gb2YgT2JqZWN0LmVudHJpZXMoZXhwb3J0cykpIHtcbiAgICAgICAgICBjaGVja0V4cG9ydENvbnRleHQobW9kdWxlRXhwb3J0LCBjdHgpO1xuICAgICAgICAgIG1vZHVsZUV4cG9ydFtyZWdpc3RlckV4cG9ydF0oY3R4LCBleHBvcnROYW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbiAgY2xpZW50VmlzaWJpbGl0eUZpbHRlciA9IHtcbiAgICBzcWw6IChmaWx0ZXIpID0+ICh7XG4gICAgICBbZXhwb3J0Q29udGV4dF06IHRoaXMuI2N0eCxcbiAgICAgIFtyZWdpc3RlckV4cG9ydF0oY3R4LCBfZXhwb3J0TmFtZSkge1xuICAgICAgICBjdHgubW9kdWxlRGVmLnJvd0xldmVsU2VjdXJpdHkucHVzaCh7IHNxbDogZmlsdGVyIH0pO1xuICAgICAgfVxuICAgIH0pXG4gIH07XG59O1xudmFyIHJlZ2lzdGVyRXhwb3J0ID0gU3ltYm9sKFwiU3BhY2V0aW1lREIucmVnaXN0ZXJFeHBvcnRcIik7XG52YXIgZXhwb3J0Q29udGV4dCA9IFN5bWJvbChcIlNwYWNldGltZURCLmV4cG9ydENvbnRleHRcIik7XG5mdW5jdGlvbiBpc01vZHVsZUV4cG9ydCh4KSB7XG4gIHJldHVybiAodHlwZW9mIHggPT09IFwiZnVuY3Rpb25cIiB8fCB0eXBlb2YgeCA9PT0gXCJvYmplY3RcIikgJiYgeCAhPT0gbnVsbCAmJiByZWdpc3RlckV4cG9ydCBpbiB4O1xufVxuZnVuY3Rpb24gY2hlY2tFeHBvcnRDb250ZXh0KGV4cCwgc2NoZW1hMikge1xuICBpZiAoZXhwW2V4cG9ydENvbnRleHRdICE9IG51bGwgJiYgZXhwW2V4cG9ydENvbnRleHRdICE9PSBzY2hlbWEyKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIm11bHRpcGxlIHNjaGVtYXMgYXJlIG5vdCBzdXBwb3J0ZWRcIik7XG4gIH1cbn1cbmZ1bmN0aW9uIGlzVW50eXBlZFRhYmxlU2NoZW1hKHgpIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSBcIm9iamVjdFwiICYmIHggIT09IG51bGwgJiYgaGFzT3duKHgsIFwidGFibGVEZWZcIik7XG59XG5mdW5jdGlvbiBpc1N1Ym1vZHVsZU5hbWVzcGFjZSh4KSB7XG4gIHJldHVybiB0eXBlb2YgeCA9PT0gXCJvYmplY3RcIiAmJiB4ICE9PSBudWxsICYmIGhhc093bih4LCBcImRlZmF1bHRcIikgJiYgeC5kZWZhdWx0IGluc3RhbmNlb2YgU2NoZW1hO1xufVxuZnVuY3Rpb24gaXNTdWJtb2R1bGVNb3VudCh4KSB7XG4gIHJldHVybiB0eXBlb2YgeCA9PT0gXCJvYmplY3RcIiAmJiB4ICE9PSBudWxsICYmIGhhc093bih4LCBcIm1vZHVsZVwiKSAmJiAhaGFzT3duKHgsIFwiZGVmYXVsdFwiKSAmJiAhaGFzT3duKHgsIFwidGFibGVEZWZcIik7XG59XG5mdW5jdGlvbiBkZWZhdWx0SW1wb3J0RXJyb3IoYWNjTmFtZSkge1xuICByZXR1cm4gbmV3IFR5cGVFcnJvcihcbiAgICBgc2NoZW1hIGVudHJ5ICcke2FjY05hbWV9JyBsb29rcyBsaWtlIGEgZGVmYXVsdCBpbXBvcnQ7IHVzZSBcXGBpbXBvcnQgKiBhcyAke2FjY05hbWV9IGZyb20gJy4uLidcXGAgc28gdGhlIHN1Ym1vZHVsZSBjYW4gc2VlIHRoZSBsaWJyYXJ5J3MgbmFtZWQgcmVkdWNlciBleHBvcnRzLmBcbiAgKTtcbn1cbmZ1bmN0aW9uIHJlc29sdmVTdWJtb2R1bGVFbnRyeShhY2NOYW1lLCBlbnRyeSkge1xuICBpZiAoZW50cnkgaW5zdGFuY2VvZiBTY2hlbWEpIHtcbiAgICB0aHJvdyBkZWZhdWx0SW1wb3J0RXJyb3IoYWNjTmFtZSk7XG4gIH1cbiAgaWYgKGlzU3VibW9kdWxlTmFtZXNwYWNlKGVudHJ5KSkge1xuICAgIHJldHVybiB7IHN1Ym1vZHVsZTogZW50cnkgfTtcbiAgfVxuICBpZiAoIWlzU3VibW9kdWxlTW91bnQoZW50cnkpKSB7XG4gICAgcmV0dXJuIHZvaWQgMDtcbiAgfVxuICBpZiAoZW50cnkubW9kdWxlIGluc3RhbmNlb2YgU2NoZW1hKSB7XG4gICAgdGhyb3cgZGVmYXVsdEltcG9ydEVycm9yKGFjY05hbWUpO1xuICB9XG4gIGlmICghaXNTdWJtb2R1bGVOYW1lc3BhY2UoZW50cnkubW9kdWxlKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICBgc2NoZW1hIGVudHJ5ICcke2FjY05hbWV9JyBoYXMgYSBcXGBtb2R1bGVcXGAgdGhhdCBpcyBub3QgYSBzdWJtb2R1bGUgbmFtZXNwYWNlIG9iamVjdDsgcGFzcyB0aGUgcmVzdWx0IG9mIFxcYGltcG9ydCAqIGFzICR7YWNjTmFtZX0gZnJvbSAnLi4uJ1xcYC5gXG4gICAgKTtcbiAgfVxuICBpZiAoZW50cnkubmFtZSA9PT0gdm9pZCAwKSB7XG4gICAgcmV0dXJuIHsgc3VibW9kdWxlOiBlbnRyeS5tb2R1bGUgfTtcbiAgfVxuICBpZiAodHlwZW9mIGVudHJ5Lm5hbWUgIT09IFwic3RyaW5nXCIgfHwgZW50cnkubmFtZS5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgYHNjaGVtYSBlbnRyeSAnJHthY2NOYW1lfScgaGFzIGFuIGludmFsaWQgXFxgbmFtZVxcYDsgZXhwZWN0ZWQgYSBub24tZW1wdHkgc3RyaW5nIGZvciB0aGUgY2Fub25pY2FsIG5hbWVzcGFjZSBuYW1lLmBcbiAgICApO1xuICB9XG4gIHJldHVybiB7IHN1Ym1vZHVsZTogZW50cnkubW9kdWxlLCBjYW5vbmljYWxOYW1lOiBlbnRyeS5uYW1lIH07XG59XG5mdW5jdGlvbiByZWdpc3Rlck1vZHVsZUV4cG9ydHMoc2NoZW1hMiwgZXhwb3J0cywgb3B0cykge1xuICBpZiAoc2NoZW1hMi5leHBvcnRzUmVnaXN0ZXJlZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBzY2hlbWEyLmV4cG9ydHNSZWdpc3RlcmVkID0gdHJ1ZTtcbiAgZm9yIChjb25zdCBbbmFtZSwgbW9kdWxlRXhwb3J0XSBvZiBPYmplY3QuZW50cmllcyhleHBvcnRzKSkge1xuICAgIGlmIChuYW1lID09PSBcImRlZmF1bHRcIikgY29udGludWU7XG4gICAgaWYgKCFpc01vZHVsZUV4cG9ydChtb2R1bGVFeHBvcnQpKSB7XG4gICAgICBpZiAob3B0cz8uaWdub3JlTm9uTW9kdWxlRXhwb3J0cykge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJleHBvcnRpbmcgc29tZXRoaW5nIHRoYXQgaXMgbm90IGEgc3BhY2V0aW1lIGV4cG9ydFwiKTtcbiAgICB9XG4gICAgY2hlY2tFeHBvcnRDb250ZXh0KG1vZHVsZUV4cG9ydCwgc2NoZW1hMik7XG4gICAgbW9kdWxlRXhwb3J0W3JlZ2lzdGVyRXhwb3J0XShzY2hlbWEyLCBuYW1lKTtcbiAgfVxufVxuZnVuY3Rpb24gc2NoZW1hKGVudHJpZXMsIG1vZHVsZVNldHRpbmdzKSB7XG4gIGNvbnN0IGN0eCA9IG5ldyBTY2hlbWFJbm5lcigoY3R4MikgPT4ge1xuICAgIGN0eDIubW9kdWxlRGVmLmVudmlyb25tZW50ID0gZW52aXJvbm1lbnREZWNsYXJhdGlvbnMoXG4gICAgICBtb2R1bGVTZXR0aW5ncz8uZW52ID8/IHt9XG4gICAgKTtcbiAgICBpZiAobW9kdWxlU2V0dGluZ3M/LkNBU0VfQ09OVkVSU0lPTl9QT0xJQ1kgIT0gbnVsbCkge1xuICAgICAgY3R4Mi5zZXRDYXNlQ29udmVyc2lvblBvbGljeShtb2R1bGVTZXR0aW5ncy5DQVNFX0NPTlZFUlNJT05fUE9MSUNZKTtcbiAgICB9XG4gICAgY29uc3QgdGFibGVTY2hlbWFzID0ge307XG4gICAgZm9yIChjb25zdCBbYWNjTmFtZSwgZW50cnldIG9mIE9iamVjdC5lbnRyaWVzKGVudHJpZXMpKSB7XG4gICAgICBjb25zdCBtb3VudCA9IHJlc29sdmVTdWJtb2R1bGVFbnRyeShhY2NOYW1lLCBlbnRyeSk7XG4gICAgICBpZiAobW91bnQgIT09IHZvaWQgMCkge1xuICAgICAgICBjb25zdCB7IHN1Ym1vZHVsZSwgY2Fub25pY2FsTmFtZSB9ID0gbW91bnQ7XG4gICAgICAgIGNvbnN0IHsgcmF3RGVmLCBkaXNwYXRjaCB9ID0gc3VibW9kdWxlLmRlZmF1bHQuYnVpbGRTdWJtb2R1bGVEaXNwYXRjaChzdWJtb2R1bGUpO1xuICAgICAgICBkaXNwYXRjaC5uYW1lc3BhY2UgPSBhY2NOYW1lO1xuICAgICAgICBjdHgyLmFkZFN1Ym1vZHVsZSh7IG5hbWVzcGFjZTogYWNjTmFtZSwgbW9kdWxlOiByYXdEZWYgfSk7XG4gICAgICAgIGlmIChjYW5vbmljYWxOYW1lICE9PSB2b2lkIDApIHtcbiAgICAgICAgICBjdHgyLm1vZHVsZURlZi5leHBsaWNpdE5hbWVzLmVudHJpZXMucHVzaCh7XG4gICAgICAgICAgICB0YWc6IFwiTmFtZXNwYWNlXCIsXG4gICAgICAgICAgICB2YWx1ZTogeyBzb3VyY2VOYW1lOiBhY2NOYW1lLCBjYW5vbmljYWxOYW1lIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjdHgyLnN1Ym1vZHVsZURpc3BhdGNoSW5mb3MucHVzaChkaXNwYXRjaCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKCFpc1VudHlwZWRUYWJsZVNjaGVtYShlbnRyeSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBgc2NoZW1hIGVudHJ5ICcke2FjY05hbWV9JyBtdXN0IGJlIGEgdGFibGUsIGEgc3VibW9kdWxlIG5hbWVzcGFjZSBvYmplY3QsIG9yIGEgXFxgeyBuYW1lLCBtb2R1bGUgfVxcYCBzdWJtb2R1bGUgbW91bnRgXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBjb25zdCB0YWJsZTIgPSBlbnRyeTtcbiAgICAgIGNvbnN0IHRhYmxlRGVmID0gdGFibGUyLnRhYmxlRGVmKGN0eDIsIGFjY05hbWUpO1xuICAgICAgdGFibGVTY2hlbWFzW2FjY05hbWVdID0gdGFibGVUb1NjaGVtYShhY2NOYW1lLCB0YWJsZTIsIHRhYmxlRGVmKTtcbiAgICAgIGNvbnN0IHRhYmxlU291cmNlTmFtZXMgPSBjdHgyLnRhYmxlU291cmNlTmFtZXMuZ2V0KHRhYmxlMik7XG4gICAgICBpZiAodGFibGVTb3VyY2VOYW1lcyA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGN0eDIudGFibGVTb3VyY2VOYW1lcy5zZXQodGFibGUyLCBbdGFibGVEZWYuc291cmNlTmFtZV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFibGVTb3VyY2VOYW1lcy5wdXNoKHRhYmxlRGVmLnNvdXJjZU5hbWUpO1xuICAgICAgfVxuICAgICAgY3R4Mi5tb2R1bGVEZWYudGFibGVzLnB1c2godGFibGVEZWYpO1xuICAgICAgaWYgKHRhYmxlMi5zY2hlZHVsZSkge1xuICAgICAgICBjdHgyLnBlbmRpbmdTY2hlZHVsZXMucHVzaCh7XG4gICAgICAgICAgdGFibGU6IHRhYmxlMixcbiAgICAgICAgICB0YWJsZU5hbWU6IHRhYmxlRGVmLnNvdXJjZU5hbWUsXG4gICAgICAgICAgc2NoZWR1bGVBdENvbDogdGFibGUyLnNjaGVkdWxlLnNjaGVkdWxlQXRDb2wsXG4gICAgICAgICAgcmVkdWNlcjogdGFibGUyLnNjaGVkdWxlLnJlZHVjZXJcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAodGFibGUyLnRhYmxlTmFtZSkge1xuICAgICAgICBjdHgyLm1vZHVsZURlZi5leHBsaWNpdE5hbWVzLmVudHJpZXMucHVzaCh7XG4gICAgICAgICAgdGFnOiBcIlRhYmxlXCIsXG4gICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgIHNvdXJjZU5hbWU6IGFjY05hbWUsXG4gICAgICAgICAgICBjYW5vbmljYWxOYW1lOiB0YWJsZTIudGFibGVOYW1lXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHRhYmxlczogdGFibGVTY2hlbWFzLFxuICAgICAgZW52OiBtb2R1bGVTZXR0aW5ncz8uZW52ID8/IHt9XG4gICAgfTtcbiAgfSk7XG4gIHJldHVybiBuZXcgU2NoZW1hKGN0eCk7XG59XG5cbi8vIHNyYy9zZXJ2ZXIvY29uc29sZS50c1xudmFyIGltcG9ydF9vYmplY3RfaW5zcGVjdCA9IF9fdG9FU00ocmVxdWlyZV9vYmplY3RfaW5zcGVjdCgpKTtcbnZhciBmbXRMb2cgPSAoLi4uZGF0YSkgPT4gZGF0YS5tYXAoKHgpID0+IHR5cGVvZiB4ID09PSBcInN0cmluZ1wiID8geCA6ICgwLCBpbXBvcnRfb2JqZWN0X2luc3BlY3QuZGVmYXVsdCkoeCkpLmpvaW4oXCIgXCIpO1xudmFyIGNvbnNvbGVfbGV2ZWxfZXJyb3IgPSAwO1xudmFyIGNvbnNvbGVfbGV2ZWxfd2FybiA9IDE7XG52YXIgY29uc29sZV9sZXZlbF9pbmZvID0gMjtcbnZhciBjb25zb2xlX2xldmVsX2RlYnVnID0gMztcbnZhciBjb25zb2xlX2xldmVsX3RyYWNlID0gNDtcbnZhciB0aW1lck1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG52YXIgY29uc29sZTIgPSB7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3Igd2Ugd2FudCBhIGJsYW5rIHByb3RvdHlwZSwgYnV0IHR5cGVzY3JpcHQgY29tcGxhaW5zXG4gIF9fcHJvdG9fXzoge30sXG4gIFtTeW1ib2wudG9TdHJpbmdUYWddOiBcImNvbnNvbGVcIixcbiAgYXNzZXJ0OiAoY29uZGl0aW9uID0gZmFsc2UsIC4uLmRhdGEpID0+IHtcbiAgICBpZiAoIWNvbmRpdGlvbikge1xuICAgICAgc3lzMi5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX2Vycm9yLCBmbXRMb2coLi4uZGF0YSkpO1xuICAgIH1cbiAgfSxcbiAgY2xlYXI6ICgpID0+IHtcbiAgfSxcbiAgZGVidWc6ICguLi5kYXRhKSA9PiB7XG4gICAgc3lzMi5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX2RlYnVnLCBmbXRMb2coLi4uZGF0YSkpO1xuICB9LFxuICBlcnJvcjogKC4uLmRhdGEpID0+IHtcbiAgICBzeXMyLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfZXJyb3IsIGZtdExvZyguLi5kYXRhKSk7XG4gIH0sXG4gIGluZm86ICguLi5kYXRhKSA9PiB7XG4gICAgc3lzMi5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX2luZm8sIGZtdExvZyguLi5kYXRhKSk7XG4gIH0sXG4gIGxvZzogKC4uLmRhdGEpID0+IHtcbiAgICBzeXMyLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfaW5mbywgZm10TG9nKC4uLmRhdGEpKTtcbiAgfSxcbiAgdGFibGU6ICh0YWJ1bGFyRGF0YSwgX3Byb3BlcnRpZXMpID0+IHtcbiAgICBzeXMyLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfaW5mbywgZm10TG9nKHRhYnVsYXJEYXRhKSk7XG4gIH0sXG4gIHRyYWNlOiAoLi4uZGF0YSkgPT4ge1xuICAgIHN5czIuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF90cmFjZSwgZm10TG9nKC4uLmRhdGEpKTtcbiAgfSxcbiAgd2FybjogKC4uLmRhdGEpID0+IHtcbiAgICBzeXMyLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfd2FybiwgZm10TG9nKC4uLmRhdGEpKTtcbiAgfSxcbiAgZGlyOiAoX2l0ZW0sIF9vcHRpb25zKSA9PiB7XG4gIH0sXG4gIGRpcnhtbDogKC4uLl9kYXRhKSA9PiB7XG4gIH0sXG4gIC8vIENvdW50aW5nXG4gIGNvdW50OiAoX2xhYmVsID0gXCJkZWZhdWx0XCIpID0+IHtcbiAgfSxcbiAgY291bnRSZXNldDogKF9sYWJlbCA9IFwiZGVmYXVsdFwiKSA9PiB7XG4gIH0sXG4gIC8vIEdyb3VwaW5nXG4gIGdyb3VwOiAoLi4uX2RhdGEpID0+IHtcbiAgfSxcbiAgZ3JvdXBDb2xsYXBzZWQ6ICguLi5fZGF0YSkgPT4ge1xuICB9LFxuICBncm91cEVuZDogKCkgPT4ge1xuICB9LFxuICAvLyBUaW1pbmdcbiAgdGltZTogKGxhYmVsID0gXCJkZWZhdWx0XCIpID0+IHtcbiAgICBpZiAodGltZXJNYXAuaGFzKGxhYmVsKSkge1xuICAgICAgc3lzMi5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX3dhcm4sIGBUaW1lciAnJHtsYWJlbH0nIGFscmVhZHkgZXhpc3RzLmApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aW1lck1hcC5zZXQobGFiZWwsIHN5czIuY29uc29sZV90aW1lcl9zdGFydChsYWJlbCkpO1xuICB9LFxuICB0aW1lTG9nOiAobGFiZWwgPSBcImRlZmF1bHRcIiwgLi4uZGF0YSkgPT4ge1xuICAgIHN5czIuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9pbmZvLCBmbXRMb2cobGFiZWwsIC4uLmRhdGEpKTtcbiAgfSxcbiAgdGltZUVuZDogKGxhYmVsID0gXCJkZWZhdWx0XCIpID0+IHtcbiAgICBjb25zdCBzcGFuSWQgPSB0aW1lck1hcC5nZXQobGFiZWwpO1xuICAgIGlmIChzcGFuSWQgPT09IHZvaWQgMCkge1xuICAgICAgc3lzMi5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX3dhcm4sIGBUaW1lciAnJHtsYWJlbH0nIGRvZXMgbm90IGV4aXN0LmApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzeXMyLmNvbnNvbGVfdGltZXJfZW5kKHNwYW5JZCk7XG4gICAgdGltZXJNYXAuZGVsZXRlKGxhYmVsKTtcbiAgfSxcbiAgLy8gQWRkaXRpb25hbCBjb25zb2xlIG1ldGhvZHMgdG8gc2F0aXNmeSB0aGUgQ29uc29sZSBpbnRlcmZhY2VcbiAgdGltZVN0YW1wOiAoKSA9PiB7XG4gIH0sXG4gIHByb2ZpbGU6ICgpID0+IHtcbiAgfSxcbiAgcHJvZmlsZUVuZDogKCkgPT4ge1xuICB9XG59O1xuXG4vLyBzcmMvc2VydmVyL3BvbHlmaWxscy50c1xuZ2xvYmFsVGhpcy5jb25zb2xlID0gY29uc29sZTI7XG4vKiEgQnVuZGxlZCBsaWNlbnNlIGluZm9ybWF0aW9uOlxuXG5zdGF0dXNlcy9pbmRleC5qczpcbiAgKCohXG4gICAqIHN0YXR1c2VzXG4gICAqIENvcHlyaWdodChjKSAyMDE0IEpvbmF0aGFuIE9uZ1xuICAgKiBDb3B5cmlnaHQoYykgMjAxNiBEb3VnbGFzIENocmlzdG9waGVyIFdpbHNvblxuICAgKiBNSVQgTGljZW5zZWRcbiAgICopXG4qL1xuXG5leHBvcnQgeyBBcnJheUJ1aWxkZXIsIEFycmF5Q29sdW1uQnVpbGRlciwgQm9vbEJ1aWxkZXIsIEJvb2xDb2x1bW5CdWlsZGVyLCBCb29sZWFuRXhwciwgQnl0ZUFycmF5QnVpbGRlciwgQnl0ZUFycmF5Q29sdW1uQnVpbGRlciwgQ2FzZUNvbnZlcnNpb25Qb2xpY3ksIENvbHVtbkJ1aWxkZXIsIENvbHVtbkV4cHJlc3Npb24sIENvbm5lY3Rpb25JZEJ1aWxkZXIsIENvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIsIEYzMkJ1aWxkZXIsIEYzMkNvbHVtbkJ1aWxkZXIsIEY2NEJ1aWxkZXIsIEY2NENvbHVtbkJ1aWxkZXIsIEkxMjhCdWlsZGVyLCBJMTI4Q29sdW1uQnVpbGRlciwgSTE2QnVpbGRlciwgSTE2Q29sdW1uQnVpbGRlciwgSTI1NkJ1aWxkZXIsIEkyNTZDb2x1bW5CdWlsZGVyLCBJMzJCdWlsZGVyLCBJMzJDb2x1bW5CdWlsZGVyLCBJNjRCdWlsZGVyLCBJNjRDb2x1bW5CdWlsZGVyLCBJOEJ1aWxkZXIsIEk4Q29sdW1uQnVpbGRlciwgSWRlbnRpdHlCdWlsZGVyLCBJZGVudGl0eUNvbHVtbkJ1aWxkZXIsIE9wdGlvbkJ1aWxkZXIsIE9wdGlvbkNvbHVtbkJ1aWxkZXIsIFByb2R1Y3RCdWlsZGVyLCBQcm9kdWN0Q29sdW1uQnVpbGRlciwgUmFuZ2UsIFJlZkJ1aWxkZXIsIFJlcXVlc3QsIFJlc3VsdEJ1aWxkZXIsIFJlc3VsdENvbHVtbkJ1aWxkZXIsIFJvdXRlciwgUm93QnVpbGRlciwgU2NoZWR1bGVBdCwgU2NoZWR1bGVBdEJ1aWxkZXIsIFNjaGVkdWxlQXRDb2x1bW5CdWlsZGVyLCBTZW5kZXJFcnJvciwgU2ltcGxlU3VtQnVpbGRlciwgU2ltcGxlU3VtQ29sdW1uQnVpbGRlciwgU3BhY2V0aW1lSG9zdEVycm9yLCBTdHJpbmdCdWlsZGVyLCBTdHJpbmdDb2x1bW5CdWlsZGVyLCBTdW1CdWlsZGVyLCBTdW1Db2x1bW5CdWlsZGVyLCBTeW5jUmVzcG9uc2UsIFRpbWVEdXJhdGlvbkJ1aWxkZXIsIFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIsIFRpbWVzdGFtcEJ1aWxkZXIsIFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIsIFR5cGVCdWlsZGVyLCBVMTI4QnVpbGRlciwgVTEyOENvbHVtbkJ1aWxkZXIsIFUxNkJ1aWxkZXIsIFUxNkNvbHVtbkJ1aWxkZXIsIFUyNTZCdWlsZGVyLCBVMjU2Q29sdW1uQnVpbGRlciwgVTMyQnVpbGRlciwgVTMyQ29sdW1uQnVpbGRlciwgVTY0QnVpbGRlciwgVTY0Q29sdW1uQnVpbGRlciwgVThCdWlsZGVyLCBVOENvbHVtbkJ1aWxkZXIsIFV1aWRCdWlsZGVyLCBVdWlkQ29sdW1uQnVpbGRlciwgYW5kLCBjcmVhdGVUYWJsZVJlZkZyb21EZWYsIGVycm9ycywgZXZhbHVhdGVCb29sZWFuRXhwciwgZ2V0UXVlcnlBY2Nlc3Nvck5hbWUsIGdldFF1ZXJ5VGFibGVOYW1lLCBnZXRRdWVyeVdoZXJlQ2xhdXNlLCBpc1Jvd1R5cGVkUXVlcnksIGlzVHlwZWRRdWVyeSwgbGl0ZXJhbCwgbWFrZUZyb21CdWlsZGVyLCBtYWtlUXVlcnlCdWlsZGVyLCBub3QsIG9yLCBzY2hlbWEsIHQsIHRhYmxlLCB0b0NhbWVsQ2FzZSwgdG9Db21wYXJhYmxlVmFsdWUsIHRvU3FsIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5tanMubWFwXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5tanMubWFwIiwiLy8gTGl2ZSBjbGFpbSB0cmFja2VyLiBUaGUgYmFja2VuZCByZXBvcnRzIGVhY2ggc3RlcCBvZiBhIGNsYWltOyBhbnkgc2NyZWVuIHN1YnNjcmliZWRcbi8vIHRvIHRoZXNlIHRhYmxlcyAodGhlIG93bmVyJ3MgcGhvbmUsIGEgZmFtaWx5IG1lbWJlciwgYSBqdWRnZSkgdXBkYXRlcyBpbnN0YW50bHkuXG4vLyBQdWJsaWMgdGFibGVzIGhvbGQgbm8gcGVyc29uYWwgZGF0YTogY2xhaW0gaWRzLCB0aGUgY2FyJ3MgeWVhci9tYWtlL21vZGVsLCBkb2xsYXIgYW1vdW50cywgc3RlcCBuYW1lcy5cbmltcG9ydCB7IHNjaGVtYSwgdGFibGUsIHQsIFNlbmRlckVycm9yIH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcblxuY29uc3Qgc3BhY2V0aW1lZGIgPSBzY2hlbWEoe1xuICAvLyBJZGVudGl0aWVzIGFsbG93ZWQgdG8gd3JpdGUgKHRoZSBUb3RhbGVkIGJhY2tlbmQpLiBUaGUgZmlyc3QgY2FsbGVyIG9mIGNsYWltX3dyaXRlciBiZWNvbWVzIHRoZSB3cml0ZXIuXG4gIHdyaXRlcjogdGFibGUoeyBuYW1lOiAnd3JpdGVyJyB9LCB7IGlkZW50aXR5OiB0LmlkZW50aXR5KCkucHJpbWFyeUtleSgpIH0pLFxuICBjbGFpbTogdGFibGUoXG4gICAgeyBuYW1lOiAnY2xhaW0nLCBwdWJsaWM6IHRydWUgfSxcbiAgICB7XG4gICAgICBjbGFpbUlkOiB0LnN0cmluZygpLnByaW1hcnlLZXkoKSxcbiAgICAgIHZlaGljbGU6IHQuc3RyaW5nKCksXG4gICAgICBzdGVwOiB0LnN0cmluZygpLFxuICAgICAgb2ZmZXJUb3RhbDogdC5mNjQoKSxcbiAgICAgIGNvdW50ZXJvZmZlclRvdGFsOiB0LmY2NCgpLFxuICAgICAgY2hlY2tzRmFpbGVkOiB0LnUzMigpLFxuICAgICAgd2Fsa0F3YXk6IHQuZjY0KCksXG4gICAgICBkZXBvc2l0OiB0LmY2NCgpLFxuICAgICAgdXBkYXRlZEF0OiB0LnRpbWVzdGFtcCgpLFxuICAgIH1cbiAgKSxcbiAgY2xhaW1FdmVudDogdGFibGUoXG4gICAgeyBuYW1lOiAnY2xhaW1fZXZlbnQnLCBwdWJsaWM6IHRydWUgfSxcbiAgICB7XG4gICAgICBpZDogdC51NjQoKS5wcmltYXJ5S2V5KCkuYXV0b0luYygpLFxuICAgICAgY2xhaW1JZDogdC5zdHJpbmcoKS5pbmRleCgnYnRyZWUnKSxcbiAgICAgIGtpbmQ6IHQuc3RyaW5nKCksXG4gICAgICBkZXRhaWw6IHQuc3RyaW5nKCksIC8vIEpTT05cbiAgICAgIGF0OiB0LnRpbWVzdGFtcCgpLFxuICAgIH1cbiAgKSxcbn0pO1xuZXhwb3J0IGRlZmF1bHQgc3BhY2V0aW1lZGI7XG5cbmV4cG9ydCBjb25zdCBjbGFpbVdyaXRlciA9IHNwYWNldGltZWRiLnJlZHVjZXIoY3R4ID0+IHtcbiAgaWYgKGN0eC5kYi53cml0ZXIuY291bnQoKSA+IDBuKSB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ0Egd3JpdGVyIGlzIGFscmVhZHkgcmVnaXN0ZXJlZCcpO1xuICBjdHguZGIud3JpdGVyLmluc2VydCh7IGlkZW50aXR5OiBjdHguc2VuZGVyIH0pO1xufSk7XG5cbmV4cG9ydCBjb25zdCByZWNvcmRFdmVudCA9IHNwYWNldGltZWRiLnJlZHVjZXIoXG4gIHtcbiAgICBjbGFpbUlkOiB0LnN0cmluZygpLFxuICAgIGtpbmQ6IHQuc3RyaW5nKCksXG4gICAgZGV0YWlsOiB0LnN0cmluZygpLFxuICAgIHZlaGljbGU6IHQuc3RyaW5nKCksXG4gICAgb2ZmZXJUb3RhbDogdC5mNjQoKSxcbiAgICBjb3VudGVyb2ZmZXJUb3RhbDogdC5mNjQoKSxcbiAgICBjaGVja3NGYWlsZWQ6IHQudTMyKCksXG4gICAgd2Fsa0F3YXk6IHQuZjY0KCksXG4gICAgZGVwb3NpdDogdC5mNjQoKSxcbiAgfSxcbiAgKGN0eCwgYSkgPT4ge1xuICAgIGlmICghY3R4LmRiLndyaXRlci5pZGVudGl0eS5maW5kKGN0eC5zZW5kZXIpKSB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ05vdCBhdXRob3JpemVkJyk7XG4gICAgY3R4LmRiLmNsYWltRXZlbnQuaW5zZXJ0KHsgaWQ6IDBuLCBjbGFpbUlkOiBhLmNsYWltSWQsIGtpbmQ6IGEua2luZCwgZGV0YWlsOiBhLmRldGFpbCwgYXQ6IGN0eC50aW1lc3RhbXAgfSk7XG4gICAgY29uc3Qgcm93ID0ge1xuICAgICAgY2xhaW1JZDogYS5jbGFpbUlkLFxuICAgICAgdmVoaWNsZTogYS52ZWhpY2xlLFxuICAgICAgc3RlcDogYS5raW5kLFxuICAgICAgb2ZmZXJUb3RhbDogYS5vZmZlclRvdGFsLFxuICAgICAgY291bnRlcm9mZmVyVG90YWw6IGEuY291bnRlcm9mZmVyVG90YWwsXG4gICAgICBjaGVja3NGYWlsZWQ6IGEuY2hlY2tzRmFpbGVkLFxuICAgICAgd2Fsa0F3YXk6IGEud2Fsa0F3YXksXG4gICAgICBkZXBvc2l0OiBhLmRlcG9zaXQsXG4gICAgICB1cGRhdGVkQXQ6IGN0eC50aW1lc3RhbXAsXG4gICAgfTtcbiAgICBpZiAoY3R4LmRiLmNsYWltLmNsYWltSWQuZmluZChhLmNsYWltSWQpKSBjdHguZGIuY2xhaW0uY2xhaW1JZC51cGRhdGUocm93KTtcbiAgICBlbHNlIGN0eC5kYi5jbGFpbS5pbnNlcnQocm93KTtcbiAgfVxuKTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBSUEsYUFBVyxPQUFPO0FBQ3RCLElBQUlDLGNBQVksT0FBTztBQUN2QixJQUFJQyxxQkFBbUIsT0FBTztBQUM5QixJQUFJQyxzQkFBb0IsT0FBTztBQUMvQixJQUFJQyxpQkFBZSxPQUFPO0FBQzFCLElBQUlDLGlCQUFlLE9BQU8sVUFBVTtBQUNwQyxJQUFJQyxnQkFBYyxJQUFJLFFBQVEsU0FBUyxZQUFZO0FBQ2pELFFBQU8sUUFBUSxHQUFHLEdBQUdILG9CQUFrQixHQUFHLENBQUMsTUFBTSxNQUFNLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxTQUFTLElBQUksRUFBRSxJQUFJOztBQUU3RixJQUFJSSxpQkFBZSxJQUFJLE1BQU0sUUFBUSxTQUFTO0FBQzVDLEtBQUksUUFBUSxPQUFPLFNBQVMsWUFBWSxPQUFPLFNBQVMsWUFDdEQ7T0FBSyxJQUFJLE9BQU9KLG9CQUFrQixLQUFLLENBQ3JDLEtBQUksQ0FBQ0UsZUFBYSxLQUFLLElBQUksSUFBSSxJQUFJLFFBQVEsT0FDekMsYUFBVSxJQUFJLEtBQUs7R0FBRSxXQUFXLEtBQUs7R0FBTSxZQUFZLEVBQUUsT0FBT0gsbUJBQWlCLE1BQU0sSUFBSSxLQUFLLEtBQUs7R0FBWSxDQUFDOztBQUV4SCxRQUFPOztBQUVULElBQUlNLGFBQVcsS0FBSyxZQUFZLFlBQVksU0FBUyxPQUFPLE9BQU9SLFdBQVNJLGVBQWEsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFRyxjQUtuRyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksYUFBYU4sWUFBVSxRQUFRLFdBQVc7Q0FBRSxPQUFPO0NBQUssWUFBWTtDQUFNLENBQUMsR0FBRyxRQUN6RyxJQUNEO0FBMktELElBQUksMkJBQTJCTyxVQXhLTkYsYUFBVyxFQUNsQyxtREFBbUQsU0FBUyxRQUFRO0FBQ2xFO0NBQ0EsSUFBSSxzQkFBc0I7RUFDeEIsY0FB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LENBQUUsT0FBTSxJQUFJLFlBQVksaUJBQWlCO0FBQ3JGLEtBQUksR0FBRyxXQUFXLE9BQU87RUFBRSxJQUFJO0VBQUksU0FBUyxFQUFFO0VBQVMsTUFBTSxFQUFFO0VBQU0sUUFBUSxFQUFFO0VBQVEsSUFBSSxJQUFJO0VBQVcsQ0FBQztDQUMzRyxNQUFNLE1BQU07RUFDVixTQUFTLEVBQUU7RUFDWCxTQUFTLEVBQUU7RUFDWCxNQUFNLEVBQUU7RUFDUixZQUFZLEVBQUU7RUFDZCxtQkFBbUIsRUFBRTtFQUNyQixjQUFjLEVBQUU7RUFDaEIsVUFBVSxFQUFFO0VBQ1osU0FBUyxFQUFFO0VBQ1gsV0FBVyxJQUFJO0VBQ2hCO0FBQ0QsS0FBSSxJQUFJLEdBQUcsTUFBTSxRQUFRLEtBQUssRUFBRSxRQUFRLENBQUUsS0FBSSxHQUFHLE1BQU0sUUFBUSxPQUFPLElBQUk7S0FDckUsS0FBSSxHQUFHLE1BQU0sT0FBTyxJQUFJO0VBRWhDIiwiZGVidWdJZCI6ImFjMTE2YzVhLTRkMDctNDk3ZS1iMTZhLTNlNDBmOTVjNGQzOSJ9