/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(2), exports);
__exportStar(__webpack_require__(3), exports);
__exportStar(__webpack_require__(4), exports);
__exportStar(__webpack_require__(5), exports);
__exportStar(__webpack_require__(6), exports);
__exportStar(__webpack_require__(7), exports);


/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.commands = exports.Commands = void 0;
class Commands {
    constructor(path = "./mds/command") {
        this.send = (args) => __awaiter(this, void 0, void 0, function* () {
            return this._executeCmd({ name: "send", args });
        });
        this.newaddress = () => __awaiter(this, void 0, void 0, function* () {
            return this._executeCmd({ name: "newaddress", args: {} });
        });
        this.tokencreate = (args) => __awaiter(this, void 0, void 0, function* () {
            return this._executeCmd({ name: "tokencreate", args });
        });
        this.status = () => __awaiter(this, void 0, void 0, function* () {
            return (yield this._executeCmd({ name: "status", args: {} }));
        });
        this.txpow_txpowid = (txpowId) => __awaiter(this, void 0, void 0, function* () {
            return this._executeCmd({ name: "txpow", args: { txpowid: `${txpowId}` } });
        });
        this.txpow_block = (blockNumber) => __awaiter(this, void 0, void 0, function* () {
            return this._executeCmd({
                name: "txpow",
                args: { block: `${blockNumber}` },
            });
        });
        this.txpow_address = (address) => __awaiter(this, void 0, void 0, function* () {
            return this._executeCmd({ name: "txpow", args: { address: address } });
        });
        this.balance = () => __awaiter(this, void 0, void 0, function* () {
            return this._executeCmd({ name: "balance", args: {} });
        });
        this.message = ({ to, content, application, }) => __awaiter(this, void 0, void 0, function* () {
            return this._executeCmd({
                name: "maxima",
                args: { action: "send", to, data: `${content}`, application },
            });
        });
        this.maxima = () => __awaiter(this, void 0, void 0, function* () {
            return this._executeCmd({ name: "maxima", args: {} });
        });
        this.network = () => __awaiter(this, void 0, void 0, function* () {
            return (yield this._executeCmd({
                name: "network",
                args: {},
            }));
        });
        this.help = () => __awaiter(this, void 0, void 0, function* () {
            return this._executeCmd({ name: "help", args: {} });
        });
        this.custom = (command) => __awaiter(this, void 0, void 0, function* () {
            return this._executeCmd(command);
        });
        // kissvm
        this.runscript = (data) => __awaiter(this, void 0, void 0, function* () {
            return this._executeCmd({ name: "runscript", args: Object.assign({}, data) });
        });
        this._executeCmd = (command) => __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            if (window.executeCommand === undefined) {
                return yield this._windowfetchCmd(command);
            }
            else {
                return yield Promise.resolve(this._runnableFetchCmd(command));
            }
        });
        this._runnableFetchCmd = (command) => __awaiter(this, void 0, void 0, function* () {
            const commandOutput = JSON.parse(
            // @ts-ignore
            window.executeCommand(JSON.stringify(command)));
            if (commandOutput.status) {
                return commandOutput.response;
            }
            else {
                throw new Error(commandOutput.error ? commandOutput.error : commandOutput.message); // TODO.. consistent key value
            }
        });
        this._windowfetchCmd = (command) => __awaiter(this, void 0, void 0, function* () {
            const requestOptions = {
                method: "POST",
                mode: "cors",
                headers: { "content-type": "application/json" },
                credentials: "include",
                body: JSON.stringify(command),
            };
            // @ts-ignore
            const res = yield window.fetch(this.path, requestOptions);
            if (res.status === 200) {
                const commandOutput = yield res.json();
                //   console.log(JSON.stringify(commandOutput.response));
                if (commandOutput.status) {
                    return commandOutput.response;
                }
                else {
                    throw new Error(commandOutput.error ? commandOutput.error : commandOutput.message); // TODO.. consistent key value
                }
            }
            if (res.status === 201) {
                return yield res.text();
            }
            throw new Error(`status code ${res.status}`);
        });
        this.path = path;
    }
}
exports.Commands = Commands;
exports.commands = new Commands();


/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.database = exports.Data = void 0;
class Data {
    constructor(path = "./mds/data") {
        this.path = path;
    }
    executeSQL(sql) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            if (window.executeSQL === undefined) {
                return yield this._windowExecuteSQL(sql);
            }
            else {
                return yield Promise.resolve(this._runnableExecuteSQL(sql));
            }
        });
    }
    _windowExecuteSQL(sql) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestOptions = {
                method: "POST",
                mode: "cors",
                headers: { "content-type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ sql }),
            };
            // @ts-ignore
            const res = yield window.fetch(this.path, requestOptions);
            if (res.ok) {
                return yield res.json();
            }
            throw new Error(`status code ${res.status}`);
        });
    }
    _runnableExecuteSQL(sql) {
        // @ts-ignore
        return JSON.parse(window.executeSQL(sql));
    }
}
exports.Data = Data;
exports.database = new Data();


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EventType = exports.nodeEvent = exports.ws = void 0;
exports.ws = window.location === undefined
    ? undefined
    : new WebSocket(`ws://${window.location.hostname}:8091`); // used by browser
// ws.onmessage, use types in here
exports.nodeEvent = 
// @ts-expect-error
window.nodeEvent === undefined ? undefined : JSON.parse(window.nodeEvent); // used by runnable // wrap this in parse
// 'window' is injected in graalvm
var EventType;
(function (EventType) {
    EventType[EventType["NEWBLOCK"] = 0] = "NEWBLOCK";
    EventType[EventType["NEWBALANCE"] = 1] = "NEWBALANCE";
    EventType[EventType["MAXIMA"] = 2] = "MAXIMA";
    EventType[EventType["MINING"] = 3] = "MINING";
})(EventType = exports.EventType || (exports.EventType = {}));
// node events coming from wenbsocket
// events passed in during runnable


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.pushNotification = void 0;
const pushNotification = function (notification) {
    // @ts-expect-error
    window.pushNotification === undefined ? undefined : window.pushNotification(notification);
};
exports.pushNotification = pushNotification;


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _minima_global_mds_api__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _minima_global_mds_api__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_minima_global_mds_api__WEBPACK_IMPORTED_MODULE_0__);
// var Events = require("@minima-global/mds-api");
// console.log(Events);



let mdsCmds = new _minima_global_mds_api__WEBPACK_IMPORTED_MODULE_0__.Commands();

let retries = 3;

const callStatus = () => {
  return retryPromise(mdsCmds.status, retries);
};

const retryPromise = (myProm, attemptsLeft) => {
  const newAttemptsLeft = attemptsLeft - 1;
  return new Promise((resolve, reject) => {
    //console.log(`attempt ${attemptsLeft} to call ${myProm.name}`);
    myProm().then(
      (successData) => {
        //console.log(`attempt ${attemptsLeft} success`);
        addText("**********************************************\n");
        addText("*  __  __  ____  _  _  ____  __  __    __    *\n");
        addText("* (  \\/  )(_  _)( \\( )(_  _)(  \\/  )  /__\\   *\n");
        addText("*  )    (  _)(_  )  (  _)(_  )    (  /(__)\\  *\n");
        addText("* (_/\\/\\_)(____)(_)\\_)(____)(_/\\/\\_)(__)(__) *\n");
        addText("*                                            *\n");
        addText("**********************************************\n");
        addText(
          "Welcome to Minima. For assistance type help. Then press enter.\n"
        );
        resolve(successData);
      },
      (failureData) => {
        console.log(`attempt ${attemptsLeft} failure`);
        if (newAttemptsLeft < 1) {
          reject(failureData);
        } else {
          return retryPromise(myProm, newAttemptsLeft).then(resolve, reject);
        }
      }
    );
  });
};

callStatus();

var HISTORY = [];
var histcounter = 0;

//Add text to the TextArea
function addText(text) {
  //Get the TextArea
  var txt = document.getElementById("terminal");

  //Add the text
  txt.value += text;
  txt.focus();

  //Scroll to the bottom
  txt.scrollTop = txt.scrollHeight;
}

function deleteLastLine() {
  var txt = document.getElementById("terminal");
  var content = txt.value;
  var prelastLine = content.substr(0, content.lastIndexOf("\n") + 1);
  txt.value = prelastLine;
}

//Disable all arrow keys..
window.addEventListener(
  "keydown",
  function (e) {
    //LEFT RIGHT
    if ([37, 39].indexOf(e.keyCode) > -1) {
      //UP DOWN
    } else if ([38, 40].indexOf(e.keyCode) > -1) {
      //Last line
      deleteLastLine();

      //use the History.. UP
      if (e.keyCode == 38) {
        histcounter--;
        if (histcounter < 0) {
          histcounter = 0;
        }

        //UP
        addText(HISTORY[histcounter]);
      } else {
        histcounter++;
        if (histcounter >= HISTORY.length - 1) {
          histcounter = HISTORY.length - 1;
        }

        //UP
        addText(HISTORY[histcounter]);
      }

      //And prevent normal behaviour
      e.preventDefault();

      //ENTER
    } else if ([13].indexOf(e.keyCode) > -1) {
      //Grab the Last Line..
      var txt = document.getElementById("terminal");
      var content = txt.value;
      var lastLine = content.substr(content.lastIndexOf("\n") + 1).trim();

      //Run it on Minima
      if (lastLine !== "") {
        //Add to the History
        if (lastLine != HISTORY[HISTORY.length - 1]) {
          HISTORY.push(lastLine);
        }
        histcounter = HISTORY.length;

        // check index of first space
        const indexOfSpace = lastLine.indexOf(" ");
        let commandName = "";
        let arguements = [];
        let result = {};
        // check if there is any spaces after first command
        if (indexOfSpace !== -1) {
          // get the arguements as string
          commandName = lastLine.substr(0, indexOfSpace);
          // replace spaces with comma and trim
          arguements = lastLine
            .substr(indexOfSpace, lastLine.length)
            .trim()
            .replace(/ /g, ",");
          // split them into an array then apply key/pair object
          arguements.split(",").forEach(function (x) {
            var arr = x.split(":");
            arr[1] && (result[arr[0]] = arr[1]);
          });
        }

        // call cmd
        mdsCmds
          .custom({
            name:
              commandName && commandName.length > 0 ? commandName : lastLine,
            args: { ...result },
          })
          .then((res) => {
            // console.log(res);

            //Get the JSON..
            var respstring = JSON.stringify(res, null, 2);

            //Convert line breakers..
            var linebreaker = respstring.replace(/\\n/g, "\n");

            //And add..
            addText(linebreaker + "\n");

            txt.focus();
            txt.setSelectionRange(txt.value.length, txt.value.length);
          })
          .catch((err) => {
            let dummyError = `{\n  "command": "${
              commandName && commandName.length > 0 ? commandName : lastLine
            }",\n  "status": false,\n  "error": "${err
              .toString()
              .substring(7, err.length)}"\n} `;
            addText(dummyError + "\n");
            txt.focus();
            txt.setSelectionRange(txt.value.length, txt.value.length);
          });
      } else {
        addText("");
      }

      //Move to the end..
      txt.focus();
      txt.setSelectionRange(txt.value.length, txt.value.length);
    }
  },
  false
);

})();

/******/ })()
;