module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1777711884942, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionRegion = exports.FunctionsRelayError = exports.FunctionsHttpError = exports.FunctionsFetchError = exports.FunctionsError = exports.FunctionsClient = void 0;
var FunctionsClient_1 = require("./FunctionsClient");
Object.defineProperty(exports, "FunctionsClient", { enumerable: true, get: function () { return FunctionsClient_1.FunctionsClient; } });
var types_1 = require("./types");
Object.defineProperty(exports, "FunctionsError", { enumerable: true, get: function () { return types_1.FunctionsError; } });
Object.defineProperty(exports, "FunctionsFetchError", { enumerable: true, get: function () { return types_1.FunctionsFetchError; } });
Object.defineProperty(exports, "FunctionsHttpError", { enumerable: true, get: function () { return types_1.FunctionsHttpError; } });
Object.defineProperty(exports, "FunctionsRelayError", { enumerable: true, get: function () { return types_1.FunctionsRelayError; } });
Object.defineProperty(exports, "FunctionRegion", { enumerable: true, get: function () { return types_1.FunctionRegion; } });
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {"./FunctionsClient":1777711884943,"./types":1777711884945}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1777711884943, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionsClient = void 0;
const tslib_1 = require("tslib");
const helper_1 = require("./helper");
const types_1 = require("./types");
/**
 * Client for invoking Supabase Edge Functions.
 */
class FunctionsClient {
    /**
     * Creates a new Functions client bound to an Edge Functions URL.
     *
     * @example Using supabase-js (recommended)
     * ```ts
     * import { createClient } from '@supabase/supabase-js'
     *
     * const supabase = createClient('https://xyzcompany.supabase.co', 'your-publishable-key')
     * const { data, error } = await supabase.functions.invoke('hello-world')
     * ```
     *
     * @category Functions
     *
     * @example Standalone import for bundle-sensitive environments
     * ```ts
     * import { FunctionsClient, FunctionRegion } from '@supabase/functions-js'
     *
     * const functions = new FunctionsClient('https://xyzcompany.supabase.co/functions/v1', {
     *   headers: { apikey: 'your-publishable-key' },
     *   region: FunctionRegion.UsEast1,
     * })
     * ```
     */
    constructor(url, { headers = {}, customFetch, region = types_1.FunctionRegion.Any, } = {}) {
        this.url = url;
        this.headers = headers;
        this.region = region;
        this.fetch = (0, helper_1.resolveFetch)(customFetch);
    }
    /**
     * Updates the authorization header
     * @param token - the new jwt token sent in the authorisation header
     *
     * @category Functions
     *
     * @example Setting the authorization header
     * ```ts
     * functions.setAuth(session.access_token)
     * ```
     */
    setAuth(token) {
        this.headers.Authorization = `Bearer ${token}`;
    }
    /**
     * Invokes a function
     * @param functionName - The name of the Function to invoke.
     * @param options - Options for invoking the Function.
     * @example
     * ```ts
     * const { data, error } = await functions.invoke('hello-world', {
     *   body: { name: 'Ada' },
     * })
     * ```
     *
     * @category Functions
     *
     * @remarks
     * - Requires an Authorization header.
     * - Invoke params generally match the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) spec.
     * - When you pass in a body to your function, we automatically attach the Content-Type header for `Blob`, `ArrayBuffer`, `File`, `FormData` and `String`. If it doesn't match any of these types we assume the payload is `json`, serialize it and attach the `Content-Type` header as `application/json`. You can override this behavior by passing in a `Content-Type` header of your own.
     * - Responses are automatically parsed as `json`, `blob` and `form-data` depending on the `Content-Type` header sent by your function. Responses are parsed as `text` by default.
     *
     * @example Basic invocation
     * ```js
     * const { data, error } = await supabase.functions.invoke('hello', {
     *   body: { foo: 'bar' }
     * })
     * ```
     *
     * @exampleDescription Error handling
     * A `FunctionsHttpError` error is returned if your function throws an error, `FunctionsRelayError` if the Supabase Relay has an error processing your function and `FunctionsFetchError` if there is a network error in calling your function.
     *
     * @example Error handling
     * ```js
     * import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from "@supabase/supabase-js";
     *
     * const { data, error } = await supabase.functions.invoke('hello', {
     *   headers: {
     *     "my-custom-header": 'my-custom-header-value'
     *   },
     *   body: { foo: 'bar' }
     * })
     *
     * if (error instanceof FunctionsHttpError) {
     *   const errorMessage = await error.context.json()
     *   console.log('Function returned an error', errorMessage)
     * } else if (error instanceof FunctionsRelayError) {
     *   console.log('Relay error:', error.message)
     * } else if (error instanceof FunctionsFetchError) {
     *   console.log('Fetch error:', error.message)
     * }
     * ```
     *
     * @exampleDescription Passing custom headers
     * You can pass custom headers to your function. Note: supabase-js automatically passes the `Authorization` header with the signed in user's JWT.
     *
     * @example Passing custom headers
     * ```js
     * const { data, error } = await supabase.functions.invoke('hello', {
     *   headers: {
     *     "my-custom-header": 'my-custom-header-value'
     *   },
     *   body: { foo: 'bar' }
     * })
     * ```
     *
     * @exampleDescription Calling with DELETE HTTP verb
     * You can also set the HTTP verb to `DELETE` when calling your Edge Function.
     *
     * @example Calling with DELETE HTTP verb
     * ```js
     * const { data, error } = await supabase.functions.invoke('hello', {
     *   headers: {
     *     "my-custom-header": 'my-custom-header-value'
     *   },
     *   body: { foo: 'bar' },
     *   method: 'DELETE'
     * })
     * ```
     *
     * @exampleDescription Invoking a Function in the UsEast1 region
     * Here are the available regions:
     * - `FunctionRegion.Any`
     * - `FunctionRegion.ApNortheast1`
     * - `FunctionRegion.ApNortheast2`
     * - `FunctionRegion.ApSouth1`
     * - `FunctionRegion.ApSoutheast1`
     * - `FunctionRegion.ApSoutheast2`
     * - `FunctionRegion.CaCentral1`
     * - `FunctionRegion.EuCentral1`
     * - `FunctionRegion.EuWest1`
     * - `FunctionRegion.EuWest2`
     * - `FunctionRegion.EuWest3`
     * - `FunctionRegion.SaEast1`
     * - `FunctionRegion.UsEast1`
     * - `FunctionRegion.UsWest1`
     * - `FunctionRegion.UsWest2`
     *
     * @example Invoking a Function in the UsEast1 region
     * ```js
     * import { createClient, FunctionRegion } from '@supabase/supabase-js'
     *
     * const { data, error } = await supabase.functions.invoke('hello', {
     *   body: { foo: 'bar' },
     *   region: FunctionRegion.UsEast1
     * })
     * ```
     *
     * @exampleDescription Calling with GET HTTP verb
     * You can also set the HTTP verb to `GET` when calling your Edge Function.
     *
     * @example Calling with GET HTTP verb
     * ```js
     * const { data, error } = await supabase.functions.invoke('hello', {
     *   headers: {
     *     "my-custom-header": 'my-custom-header-value'
     *   },
     *   method: 'GET'
     * })
     * ```
     *
     * @example Example 7
     * ```ts
     * const { data, error } = await functions.invoke('hello-world', {
     *   body: { name: 'Ada' },
     * })
     * ```
     */
    invoke(functionName_1) {
        return tslib_1.__awaiter(this, arguments, void 0, function* (functionName, options = {}) {
            var _a;
            let timeoutId;
            let timeoutController;
            try {
                const { headers, method, body: functionArgs, signal, timeout } = options;
                let _headers = {};
                let { region } = options;
                if (!region) {
                    region = this.region;
                }
                // Add region as query parameter using URL API
                const url = new URL(`${this.url}/${functionName}`);
                if (region && region !== 'any') {
                    _headers['x-region'] = region;
                    url.searchParams.set('forceFunctionRegion', region);
                }
                let body;
                if (functionArgs &&
                    ((headers && !Object.prototype.hasOwnProperty.call(headers, 'Content-Type')) || !headers)) {
                    if ((typeof Blob !== 'undefined' && functionArgs instanceof Blob) ||
                        functionArgs instanceof ArrayBuffer) {
                        // will work for File as File inherits Blob
                        // also works for ArrayBuffer as it is the same underlying structure as a Blob
                        _headers['Content-Type'] = 'application/octet-stream';
                        body = functionArgs;
                    }
                    else if (typeof functionArgs === 'string') {
                        // plain string
                        _headers['Content-Type'] = 'text/plain';
                        body = functionArgs;
                    }
                    else if (typeof FormData !== 'undefined' && functionArgs instanceof FormData) {
                        // don't set content-type headers
                        // Request will automatically add the right boundary value
                        body = functionArgs;
                    }
                    else {
                        // default, assume this is JSON
                        _headers['Content-Type'] = 'application/json';
                        body = JSON.stringify(functionArgs);
                    }
                }
                else {
                    if (functionArgs &&
                        typeof functionArgs !== 'string' &&
                        !(typeof Blob !== 'undefined' && functionArgs instanceof Blob) &&
                        !(functionArgs instanceof ArrayBuffer) &&
                        !(typeof FormData !== 'undefined' && functionArgs instanceof FormData)) {
                        body = JSON.stringify(functionArgs);
                    }
                    else {
                        body = functionArgs;
                    }
                }
                // Handle timeout by creating an AbortController
                let effectiveSignal = signal;
                if (timeout) {
                    timeoutController = new AbortController();
                    timeoutId = setTimeout(() => timeoutController.abort(), timeout);
                    // If user provided their own signal, we need to respect both
                    if (signal) {
                        effectiveSignal = timeoutController.signal;
                        // If the user's signal is aborted, abort our timeout controller too
                        signal.addEventListener('abort', () => timeoutController.abort());
                    }
                    else {
                        effectiveSignal = timeoutController.signal;
                    }
                }
                const response = yield this.fetch(url.toString(), {
                    method: method || 'POST',
                    // headers priority is (high to low):
                    // 1. invoke-level headers
                    // 2. client-level headers
                    // 3. default Content-Type header
                    headers: Object.assign(Object.assign(Object.assign({}, _headers), this.headers), headers),
                    body,
                    signal: effectiveSignal,
                }).catch((fetchError) => {
                    throw new types_1.FunctionsFetchError(fetchError);
                });
                const isRelayError = response.headers.get('x-relay-error');
                if (isRelayError && isRelayError === 'true') {
                    throw new types_1.FunctionsRelayError(response);
                }
                if (!response.ok) {
                    throw new types_1.FunctionsHttpError(response);
                }
                let responseType = ((_a = response.headers.get('Content-Type')) !== null && _a !== void 0 ? _a : 'text/plain').split(';')[0].trim();
                let data;
                if (responseType === 'application/json') {
                    data = yield response.json();
                }
                else if (responseType === 'application/octet-stream' ||
                    responseType === 'application/pdf') {
                    data = yield response.blob();
                }
                else if (responseType === 'text/event-stream') {
                    data = response;
                }
                else if (responseType === 'multipart/form-data') {
                    data = yield response.formData();
                }
                else {
                    // default to text
                    data = yield response.text();
                }
                return { data, error: null, response };
            }
            catch (error) {
                return {
                    data: null,
                    error,
                    response: error instanceof types_1.FunctionsHttpError || error instanceof types_1.FunctionsRelayError
                        ? error.context
                        : undefined,
                };
            }
            finally {
                // Clear the timeout if it was set
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            }
        });
    }
}
exports.FunctionsClient = FunctionsClient;
//# sourceMappingURL=FunctionsClient.js.map
}, function(modId) { var map = {"./helper":1777711884944,"./types":1777711884945}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1777711884944, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveFetch = void 0;
const resolveFetch = (customFetch) => {
    if (customFetch) {
        return (...args) => customFetch(...args);
    }
    return (...args) => fetch(...args);
};
exports.resolveFetch = resolveFetch;
//# sourceMappingURL=helper.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1777711884945, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionRegion = exports.FunctionsHttpError = exports.FunctionsRelayError = exports.FunctionsFetchError = exports.FunctionsError = void 0;
/**
 * Base error for Supabase Edge Function invocations.
 *
 * @example
 * ```ts
 * import { FunctionsError } from '@supabase/functions-js'
 *
 * throw new FunctionsError('Unexpected error invoking function', 'FunctionsError', {
 *   requestId: 'abc123',
 * })
 * ```
 */
class FunctionsError extends Error {
    constructor(message, name = 'FunctionsError', context) {
        super(message);
        this.name = name;
        this.context = context;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            context: this.context,
        };
    }
}
exports.FunctionsError = FunctionsError;
/**
 * Error thrown when the network request to an Edge Function fails.
 *
 * @example
 * ```ts
 * import { FunctionsFetchError } from '@supabase/functions-js'
 *
 * throw new FunctionsFetchError({ requestId: 'abc123' })
 * ```
 */
class FunctionsFetchError extends FunctionsError {
    constructor(context) {
        super('Failed to send a request to the Edge Function', 'FunctionsFetchError', context);
    }
}
exports.FunctionsFetchError = FunctionsFetchError;
/**
 * Error thrown when the Supabase relay cannot reach the Edge Function.
 *
 * @example
 * ```ts
 * import { FunctionsRelayError } from '@supabase/functions-js'
 *
 * throw new FunctionsRelayError({ region: 'us-east-1' })
 * ```
 */
class FunctionsRelayError extends FunctionsError {
    constructor(context) {
        super('Relay Error invoking the Edge Function', 'FunctionsRelayError', context);
    }
}
exports.FunctionsRelayError = FunctionsRelayError;
/**
 * Error thrown when the Edge Function returns a non-2xx status code.
 *
 * @example
 * ```ts
 * import { FunctionsHttpError } from '@supabase/functions-js'
 *
 * throw new FunctionsHttpError({ status: 500 })
 * ```
 */
class FunctionsHttpError extends FunctionsError {
    constructor(context) {
        super('Edge Function returned a non-2xx status code', 'FunctionsHttpError', context);
    }
}
exports.FunctionsHttpError = FunctionsHttpError;
// Define the enum for the 'region' property
var FunctionRegion;
(function (FunctionRegion) {
    FunctionRegion["Any"] = "any";
    FunctionRegion["ApNortheast1"] = "ap-northeast-1";
    FunctionRegion["ApNortheast2"] = "ap-northeast-2";
    FunctionRegion["ApSouth1"] = "ap-south-1";
    FunctionRegion["ApSoutheast1"] = "ap-southeast-1";
    FunctionRegion["ApSoutheast2"] = "ap-southeast-2";
    FunctionRegion["CaCentral1"] = "ca-central-1";
    FunctionRegion["EuCentral1"] = "eu-central-1";
    FunctionRegion["EuWest1"] = "eu-west-1";
    FunctionRegion["EuWest2"] = "eu-west-2";
    FunctionRegion["EuWest3"] = "eu-west-3";
    FunctionRegion["SaEast1"] = "sa-east-1";
    FunctionRegion["UsEast1"] = "us-east-1";
    FunctionRegion["UsWest1"] = "us-west-1";
    FunctionRegion["UsWest2"] = "us-west-2";
})(FunctionRegion || (exports.FunctionRegion = FunctionRegion = {}));
//# sourceMappingURL=types.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1777711884942);
})()
//miniprogram-npm-outsideDeps=["tslib"]
//# sourceMappingURL=index.js.map