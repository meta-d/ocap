// @ts-nocheck

/**
*   <p>
*   This class is used to indicate an runtime errors occurring in any of the methods of the xmla4js classes.
*   </p>
*   <p>
*   You do not need to instantiate objects of this class yourself.
*   Rather, instances of this class are created and thrown at runtime whenever an error occurs.
*   The purpose is to provide a clean and clear way for applications that use xmla4js to recognize and handle Xmla4js specific runtime errors.
*   </p>
*   <p>
*   To handle Xmla4js errors, you can use a <code>try...catch</code> block like this:
*   </p>
<pre>
&nbsp;try {
&nbsp;    ...general xmla4js work...
&nbsp;} catch (exception) {
&nbsp;    if (exception instanceof Xmla.Exception) {
&nbsp;        ...use exception.code, exception.message and exception.data to handle the exception.
&nbsp;    } else {
&nbsp;        ...handle other errors...
&nbsp;    }
&nbsp;}
</pre>
*
*   @class Xmla.Exception
*   @constructor
*/
Xmla.Exception = function (type, code, message, helpfile, source, data, args) {
  this.type = type
  this.code = code
  this.message = message
  this.source = source
  this.helpfile = helpfile
  this.data = data
  this.args = args
  return this
}

/**
 *   Can appear as value for the <code><a href="#property_type">type</a></code> property of instances of the <code><a href="#class_Xmla.Exception">Xmla.Exception</a></code> class,
 *   and indicates that this <code>Xmla.Exception</code> signals a warning.
 *
 *   @property TYPE_WARNING
 *   @static
 *   @final
 *   type string
 *   @default <code>warning</code>
 */
Xmla.Exception.TYPE_WARNING = 'warning'
/**
 *   Can appear as value for the <code><a href="#property_type">type</a></code> property of instances of the <code><a href="#class_Xmla.Exception">Xmla.Exception</a></code> class,
 *   and indicates that this <code>Xmla.Exception</code> signals an error.
 *
 *   @property TYPE_ERROR
 *   @static
 *   @final
 *   type string
 *   @default <code>error</code>
 */
Xmla.Exception.TYPE_ERROR = 'error'

var _exceptionHlp = 'http://code.google.com/p/xmla4js/wiki/ExceptionCodes'

/**
 *   Exception code indicating a <code>requestType</code> option was expected but ommitted.
 *
 *   @property MISSING_REQUEST_TYPE_CDE
 *   @static
 *   @final
 *   type int
 *   @default <code>-1</code>
 */
Xmla.Exception.MISSING_REQUEST_TYPE_CDE = -1
Xmla.Exception.MISSING_REQUEST_TYPE_MSG = 'Missing_Request_Type'
Xmla.Exception.MISSING_REQUEST_TYPE_HLP =
  _exceptionHlp +
  '#' +
  Xmla.Exception.MISSING_REQUEST_TYPE_CDE +
  '_' +
  Xmla.Exception.MISSING_REQUEST_TYPE_MSG
/**
 *   Exception code indicating a <code>statement</code> option was expected but ommitted.
 *
 *   @property MISSING_STATEMENT_CDE
 *   @static
 *   @final
 *   type int
 *   @default <code>-2</code>
 */
Xmla.Exception.MISSING_STATEMENT_CDE = -2
Xmla.Exception.MISSING_STATEMENT_MSG = 'Missing_Statement'
Xmla.Exception.MISSING_STATEMENT_HLP =
  _exceptionHlp +
  '#' +
  Xmla.Exception.MISSING_STATEMENT_CDE +
  '_' +
  Xmla.Exception.MISSING_STATEMENT_MSG

/**
 *   Exception code indicating a <code>url</code> option was expected but ommitted.
 *
 *   @property MISSING_URL_CDE
 *   @static
 *   @final
 *   type int
 *   @default <code>-3</code>
 */
Xmla.Exception.MISSING_URL_CDE = -3
Xmla.Exception.MISSING_URL_MSG = 'Missing_URL'
Xmla.Exception.MISSING_URL_HLP =
  _exceptionHlp + '#' + Xmla.Exception.MISSING_URL_CDE + '_' + Xmla.Exception.MISSING_URL_MSG

/**
 *   Exception code indicating a <code>events</code> were expected but ommitted.
 *
 *   @property NO_EVENTS_SPECIFIED_CDE
 *   @static
 *   @final
 *   type int
 *   @default <code>-4</code>
 */
Xmla.Exception.NO_EVENTS_SPECIFIED_CDE = -4
Xmla.Exception.NO_EVENTS_SPECIFIED_MSG = 'No_Events_Specified'
Xmla.Exception.NO_EVENTS_SPECIFIED_HLP =
  _exceptionHlp +
  '#' +
  Xmla.Exception.NO_EVENTS_SPECIFIED_CDE +
  '_' +
  Xmla.Exception.NO_EVENTS_SPECIFIED_MSG

/**
 *   Exception code indicating a <code>events</code> were specifeid in the wrong format.
 *
 *   @property WRONG_EVENTS_FORMAT_CDE
 *   @static
 *   @final
 *   type int
 *   @default <code>-5</code>
 */
Xmla.Exception.WRONG_EVENTS_FORMAT_CDE = -5
Xmla.Exception.WRONG_EVENTS_FORMAT_MSG = 'Wrong_Events_Format'
Xmla.Exception.WRONG_EVENTS_FORMAT_HLP =
  _exceptionHlp +
  '#' +
  Xmla.Exception.NO_EVENTS_SPECIFIED_CDE +
  '_' +
  Xmla.Exception.NO_EVENTS_SPECIFIED_MSG

/**
 *   Exception code indicating that the event name was unrecognized.
 *
 *   @property UNKNOWN_EVENT_CDE
 *   @static
 *   @final
 *   type int
 *   @default <code>-6</code>
 */
Xmla.Exception.UNKNOWN_EVENT_CDE = -6
Xmla.Exception.UNKNOWN_EVENT_MSG = 'Unknown_Event'
Xmla.Exception.UNKNOWN_EVENT_HLP =
  _exceptionHlp + '#' + Xmla.Exception.UNKNOWN_EVENT_CDE + '_' + Xmla.Exception.UNKNOWN_EVENT_MSG
/**
 *   Exception code indicating that no proper handler was passed for the events.
 *
 *   @property INVALID_EVENT_HANDLER_CDE
 *   @static
 *   @final
 *   type int
 *   @default <code>-7</code>
 */
Xmla.Exception.INVALID_EVENT_HANDLER_CDE = -7
Xmla.Exception.INVALID_EVENT_HANDLER_MSG = 'Invalid_Events_Handler'
Xmla.Exception.INVALID_EVENT_HANDLER_HLP =
  _exceptionHlp +
  '#' +
  Xmla.Exception.INVALID_EVENT_HANDLER_CDE +
  '_' +
  Xmla.Exception.INVALID_EVENT_HANDLER_MSG
/**
 *   Exception code indicating that the rrepsonse could not be parsed
 *
 *   @property ERROR_PARSING_RESPONSE_CDE
 *   @static
 *   @final
 *   type int
 *   @default <code>-8</code>
 */
Xmla.Exception.ERROR_PARSING_RESPONSE_CDE = -8
Xmla.Exception.ERROR_PARSING_RESPONSE_MSG = 'Error_Parsing_Response'
Xmla.Exception.ERROR_PARSING_RESPONSE_HLP =
  _exceptionHlp +
  '#' +
  Xmla.Exception.ERROR_PARSING_RESPONSE_CDE +
  '_' +
  Xmla.Exception.ERROR_PARSING_RESPONSE_MSG
/**
 *   Exception code indicating the field name is not valid.
 *
 *   @property INVALID_FIELD_CDE
 *   @static
 *   @final
 *   type int
 *   @default <code>-9</code>
 */
Xmla.Exception.INVALID_FIELD_CDE = -9
Xmla.Exception.INVALID_FIELD_MSG = 'Invalid_Field'
Xmla.Exception.INVALID_FIELD_HLP =
  _exceptionHlp + '#' + Xmla.Exception.INVALID_FIELD_CDE + '_' + Xmla.Exception.INVALID_FIELD_MSG

/**
 *   Exception code indicating a general XMLHttpRequest error.
 *   If this error occurs, the data object of the exception will have these members:
 *   <ul>
 *       <li>request: the options that make up the original HTTP request</li>
 *       <li>status: the HTTP status code</li>
 *       <li>statusText: the HTTP status text</li>
 *   </ul>
 *   @property HTTP_ERROR_CDE
 *   @static
 *   @final
 *   type int
 *   @default <code>-10</code>
 */
Xmla.Exception.HTTP_ERROR_CDE = -10
Xmla.Exception.HTTP_ERROR_MSG = 'HTTP Error'
Xmla.Exception.HTTP_ERROR_HLP =
  _exceptionHlp + '#' + Xmla.Exception.HTTP_ERROR_CDE + '_' + Xmla.Exception.HTTP_ERROR_MSG

/**
 *   Exception code indicating the hierarchy name is not valid.
 *
 *   @property INVALID_HIERARCHY_CDE
 *   @static
 *   @final
 *   type int
 *   @default <code>-11</code>
 */
Xmla.Exception.INVALID_HIERARCHY_CDE = -11
Xmla.Exception.INVALID_HIERARCHY_MSG = 'Invalid_Hierarchy'
Xmla.Exception.INVALID_HIERARCHY_HLP =
  _exceptionHlp +
  '#' +
  Xmla.Exception.INVALID_HIERARCHY_CDE +
  '_' +
  Xmla.Exception.INVALID_HIERARCHY_MSG

/**
 *   Exception code indicating a problem reading a member property
 *
 *   @property UNEXPECTED_ERROR_READING_MEMBER_CDE
 *   @static
 *   @final
 *   type int
 *   @default <code>-12</code>
 */
Xmla.Exception.UNEXPECTED_ERROR_READING_MEMBER_CDE = -12
Xmla.Exception.UNEXPECTED_ERROR_READING_MEMBER_MSG = 'Error_Reading_Member'
Xmla.Exception.UNEXPECTED_ERROR_READING_MEMBER_HLP =
  _exceptionHlp +
  '#' +
  Xmla.Exception.UNEXPECTED_ERROR_READING_MEMBER_CDE +
  '_' +
  Xmla.Exception.UNEXPECTED_ERROR_READING_MEMBER_MSG

/**
 *   Exception code indicating the requested axis does not exist
 *
 *   @property INVALID_AXIS
 *   @static
 *   @final
 *   type int
 *   @default <code>-13</code>
 */
Xmla.Exception.INVALID_AXIS_CDE = -13
Xmla.Exception.INVALID_AXIS_MSG = 'The requested axis does not exist.'
Xmla.Exception.INVALID_AXIS_HLP =
  _exceptionHlp + '#' + Xmla.Exception.INVALID_AXIS_CDE + '_' + Xmla.Exception.INVALID_AXIS_MSG

/**
 *   Exception code indicating illegal number of axis arguments
 *
 *   @property ILLEGAL_ARGUMENT
 *   @static
 *   @final
 *   type int
 *   @default <code>-14</code>
 */
Xmla.Exception.ILLEGAL_ARGUMENT_CDE = -14
Xmla.Exception.ILLEGAL_ARGUMENT_MSG = 'Illegal arguments'
Xmla.Exception.ILLEGAL_ARGUMENT_HLP =
  _exceptionHlp +
  '#' +
  Xmla.Exception.ILLEGAL_ARGUMENT_CDE +
  '_' +
  Xmla.Exception.ILLEGAL_ARGUMENT_MSG

/**
 *   Exception code indicating that we couldn't instantiate a xml http request object
 *
 *   @property ERROR_INSTANTIATING_XMLHTTPREQUEST
 *   @static
 *   @final
 *   type int
 *   @default <code>-15</code>
 */
Xmla.Exception.ERROR_INSTANTIATING_XMLHTTPREQUEST_CDE = -15
Xmla.Exception.ERROR_INSTANTIATING_XMLHTTPREQUEST_MSG = 'Error creating XML Http Request'
Xmla.Exception.ERROR_INSTANTIATING_XMLHTTPREQUEST_HLP =
  _exceptionHlp +
  '#' +
  Xmla.Exception.ERROR_INSTANTIATING_XMLHTTPREQUEST_CDE +
  '_' +
  Xmla.Exception.ERROR_INSTANTIATING_XMLHTTPREQUEST_MSG

Xmla.Exception._newError = function (codeName, source, data) {
  return new Xmla.Exception(
    Xmla.Exception.TYPE_ERROR,
    Xmla.Exception[codeName + '_CDE'],
    Xmla.Exception[codeName + '_MSG'],
    Xmla.Exception[codeName + '_HLP'],
    source,
    data
  )
}

Xmla.Exception.prototype = {
  /**
   *   This propery indicates what kind of exception occurred. It can have one of the following values: <dl>
   *       <dt><code><a href="property_TYPE_WARNING">TYPE_WARNING</a></code></dt><dd>Indicates a warning</dd>
   *       <dt><code><a href="property_TYPE_ERROR">TYPE_ERROR</a></code></dt><dd>Indicates an error</dd>
   *   </dl>
   *   @property type
   *   type {string}
   *   @default {null}
   */
  type: null,
  /**
   *   A code that can be used to identify this particular kind of exception.
   *   @property code
   *   type int
   *   @default {null}
   */
  code: null,
  /**
   *   A human readable message that describes the nature of the error or warning.
   *   @property message
   *   type {string}
   *   @default {null}
   */
  message: null,
  /**
   *   A name that indicates in what component (on the client or server side) this error or warning occurred.
   *   @property source
   *   type {string}
   *   @default {null}
   */
  source: null,
  /**
   *   A path or url that points to a document that contains more information about this error.
   *   @property helpfile
   *   type {string}
   *   @default {null}
   */
  helpfile: null,
  /**
   *   Additional data captured when the exception was instantiated.
   *   The type of information stored here is dependent upon the nature of the error.
   *   @property data
   *   type {string}
   *   @default {null}
   */
  data: null,
  _throw: function () {
    throw this
  },
  /**
   *   A reference to the built-in <code>arguments</code> array of the function that is throwing the exception
   *   This can be used to get a "stack trace"
   *   @property args
   *   type {array}
   */
  args: null,
  /**
   *  Returns a string representing this exception
   *   @method toString
   *   @return a string representing this exception
   */
  toString: function () {
    return this.type + ' ' + this.code + ': ' + this.message + ' (source: ' + this.source + ')'
  },
  /**
   *  Get a stack trace.
   *   @method getStackTrace
   *   @return an array of objects describing the function on the stack
   */
  getStackTrace: function () {
    var funcstring,
      stack = ''
    if (this.args) {
      var func = this.args.callee
      while (func) {
        funcstring = String(func)
        func = func.caller
      }
    }
    return stack
  },
}
