// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name content.js
// @externs_url http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/chrome_extensions.js
// @js_externs var console = {assert: function(){}};
// @formatting pretty_print
// ==/ClosureCompiler==

/** @license
  JSON Formatter | MIT License
  Copyright 2012 Callum Locke

  Permission is hereby granted, free of charge, to any person obtaining a copy of
  this software and associated documentation files (the "Software"), to deal in
  the Software without restriction, including without limitation the rights to
  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
  of the Software, and to permit persons to whom the Software is furnished to do
  so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.

 */

/*jshint eqeqeq:true, forin:true, strict:true */
/*global chrome, console */

(function () {
  "use strict";

  var jfContent,
    pre,
    jfStyleEl,
    slowAnalysisTimeout,
    port,
    startTime = +new Date(),
    domReadyTime,
    isJsonTime,
    exitedNotJsonTime,
    displayedFormattedJsonTime;

  // Open the port "jf" now, ready for when we need it
  // console.time('established port') ;
  port = chrome.extension.connect({ name: "jf" });

  // Add listener to receive response from BG when ready
  port.onMessage.addListener(function (msg) {
    // console.log('Port msg received', msg[0], (""+msg[1]).substring(0,30)) ;

    switch (msg[0]) {
      case "NOT JSON":
        pre.hidden = false;
        // console.log('Unhidden the PRE') ;
        document.body.removeChild(jfContent);
        exitedNotJsonTime = +new Date();
        break;

      case "FORMATTING":
        isJsonTime = +new Date();

        // It is JSON, and it's now being formatted in the background worker.

        // Clear the slowAnalysisTimeout (if the BG worker had taken longer than 1s to respond with an answer to whether or not this is JSON, then it would have fired, unhiding the PRE... But now that we know it's JSON, we can clear this timeout, ensuring the PRE stays hidden.)
        clearTimeout(slowAnalysisTimeout);

        // detect darkmode of user
        let matched = window.matchMedia("(prefers-color-scheme: dark)").matches;

        // Insert CSS
        jfStyleEl = document.createElement("style");
        jfStyleEl.id = "jfStyleEl";
        //jfStyleEl.innerText = 'body{padding:0;}' ;
        document.head.appendChild(jfStyleEl);

        if (matched) {
          jfStyleEl.insertAdjacentHTML(
            "beforeend",
            '#optionBar,.blockInner,.e,.kvov{display:block}.b,.bl,.n,.nl{font-weight:700}body{-webkit-user-select:text;overflow-y:scroll!important;margin:0;position:relative;background-color:#1e1e1e!important}#optionBar{-webkit-user-select:none;position:absolute;top:9px;right:17px}#buttonFormatted,#buttonPlain{-webkit-border-radius:2px;-webkit-box-shadow:0 1px 3px rgba(0,0,0,.1);-webkit-user-select:none;background:-webkit-linear-gradient(#fafafa,#f4f4f4 40%,#e5e5e5);border:1px solid #aaa;color:#444;font-size:12px;margin-bottom:0;min-width:4em;padding:3px 0;position:relative;z-index:10;display:inline-block;width:80px;text-shadow:1px 1px rgba(255,255,255,.3)}.colon,.comma-c{color: #fff;}#buttonFormatted{margin-left:0;border-top-left-radius:0;border-bottom-left-radius:0}#buttonPlain{margin-right:0;border-top-right-radius:0;border-bottom-right-radius:0;border-right:none}#buttonFormatted:hover,#buttonPlain:hover{-webkit-box-shadow:0 1px 3px rgba(0,0,0,.2);background:-webkit-linear-gradient(#fefefe,#f8f8f8 40%,#e9e9e9) #ebebeb;border-color:#999;color:#222}#buttonFormatted:active,#buttonPlain:active{-webkit-box-shadow:inset 0 1px 3px rgba(0,0,0,.2);background:-webkit-linear-gradient(#f4f4f4,#efefef 40%,#dcdcdc) #ebebeb;color:#333}#buttonFormatted.selected,#buttonPlain.selected{-webkit-box-shadow:inset 0 1px 5px rgba(0,0,0,.2);background:-webkit-linear-gradient(#e4e4e4,#dfdfdf 40%,#dcdcdc) #ebebeb;color:#333}#buttonFormatted:focus,#buttonPlain:focus{outline:0}#jsonpCloser,#jsonpOpener{padding:4px 0 0 8px;margin-bottom:-6px}#jsonpCloser{margin-top:0}pre{padding:36px 5px 5px}.kvov{padding-left:20px;margin-left:-20px;position:relative;color:#9cdcfe!important}.collapsed{white-space:nowrap}.collapsed .kvov .e,.collapsed>.blockInner{display:none}.collapsed>.ell:after{content:"…";font-weight:700}.collapsed>.ell{margin:0 4px;color:#888}.collapsed .kvov{display:inline}.e{width:20px;height:18px;position:absolute;left:-2px;top:1px;z-index:5;background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAAGzCI4dAAAMeWlDQ1BEaXNwbGF5AABIiZVXd1ST9xp+vpGEhBFGQEGQsJcosocgEKYgIBtEJSQBAiHEkKDiHqWK1i2iONG6sGi1AlIHolat1j3rKGpRqdSi1j24fySg9d577rnvOcnvPc/veZ93fN/JyQtwXwsVChlpCJTIVcrk6HB+ZlY2n/UABFggEAAfoahMEZaUFA8AvednRgAvr4IAgEvuQoVChv/PjMWSMhFA5ADIE5eJSgCiFaDXiBRKFcDMAWA3QaVQAcwZAHjKzKxsgLkcAK9A428DwMvT+AcA8JSpyQKAeR7Q0RMKlQWAwS0A/HJRgQoweA/AQy6WygHuIAAhokKhGODKAAwqKSkVA9waAM7logIFwG0F4J/3mWbBP/Tz+vSFwoI+X9MXAEAnQlqmkAkn/Z+j+d9WIlP35nAEoFeojEkGwAOI68WlcckA9ACiS56XkAjAGCBeS8WauQMkp1Adk6bhk5aiMkE2ADOA9BALI+IAWAJklFyWEK/F8/KlUbEADAFyolQVmwqgP0DOlZRFpmg5G5SlydpcZGO+UhCmxU8KlYA21x11cVqYVv9ZoSRWq08ZVBSmZgDgAJR9uTQ9AYABQA0uK06J03KGVRQKEno5SnVyGgB7gEqWyKPDNfpUeb4yKlnLryop6+2X2lAojU3Q+ntUhakxmvlQx0TCyBRNL9R5iTwsrVdHUpYZ39uLWBIRqemdeiSRp6VodV4rVOHJmliao5Alafm0rUQWnQzAFqC9y8pTtLF0ukqZqn1GdL5ClZSqqZOuKBKOSNLUQy9GPASIAB9q8JGHUhRBerarqQt87U0UhFCiABK4a5HeiAwIoYQcQqSgAn9CDgnK+uLCIYQSEpRDjg99qObbHfkQQolySFCGYjyAEiWIgwwSqKGEBPK+bOn4HUpI/y27EHyIUAoZSqGE9L/gvegnJAwCxGsRdW9GPreXyYxkRjBjmFFMF9qCDqGD6Hg6hA6lQ2hP2p8O6O3jE5/xgHGBcY9xhdHOuDFOOkv5RZUj0Q61doYS5H0+C9qR9qR96HA6mA6hA8CnzWgLuNPetD8dRg+ng2gfOgACbd1qKL+Y4RcdfPY0tDy2B5tk92OHsp2/jDRwNfDpU5FA/o/5aGrN65u3oO/my/yCz6YvRinivmRSc6m91AnqCHWKOkA1gU8dppqpM9RBqumzt+t3KFHQly0ZEshRDBmk/5ZPqM2phARlHvUenR7vNXcqyUQVAAhKFZOU0oJCFT9MoZBJ+LFy0eBBfE8PT08gMyubr/n5ej4KBADC7MwnbPZvQPDhnp6eHz9hIw4D3/sBnP2fMGd/wEgXOLlfpFaWazAaABjggAsezDEQdnCGOzzhiyCEIhIjkIhUZGEsRChECZSYgCmYiUrMx2KswGqsxyZsw3fYgyYcwBH8hNM4jyu4iXZ04DG68RLvCIJgEfqECWFOWBMOhBvhSfgTIUQkEU8kE1lELlFAyAk1MYWYTcwnlhKriY3EduJ7Yj9xhDhFXCBuEHeJTuIZ8ZakSD2SR1qRjuQQ0p8MI+PIVHIMWUCOJyvIOeRCsoasI3eSjeQR8jR5hWwnH5MvKFC6lBllQ7lT/pSASqSyqXxKSU2jqqhqqo5qoFqoE9Qlqp3qot7QTNqE5tPudBAdQ6fRIno8PY1eQK+mt9GN9DH6En2X7qY/MvQZlgw3RiAjlpHJKGBMYFQyqhlbGPsYxxlXGB2Ml0wm04zpxPRjxjCzmEXMycwFzLXMXcxW5gXmfeYLFotlznJjBbMSWUKWilXJWsXayTrMusjqYL3W0dWx1vHUidLJ1pHrzNKp1tmhc0jnos5DnXdsQ7YDO5CdyBazJ7EXsTezW9jn2B3sdxwjjhMnmJPKKeLM5NRwGjjHObc4z3V1dW11A3RH6Up1Z+jW6O7WPal7V/eNnrGeq55AL0dPrbdQb6teq94Nvef6+vqO+qH62foq/YX62/WP6t/Rf21gYjDYINZAbDDdoNag0eCiwRMum+vADeOO5VZwq7l7uee4XYZsQ0dDgaHQcJphreF+w2uGL4xMjIYaJRqVGC0w2mF0yuiRMcvY0TjSWGw8x3iT8VHj+yaUiZ2JwERkMttks8lxkw4ek+fEi+UV8ebzvuOd5XWbGpt6m6abTjStNT1o2m5GmTmaxZrJzBaZ7TG7ava2n1W/sH6SfvP6NfS72O9V/wH9Q/tL+lf139X/Sv+35nzzSPNi8yXmTea3LWgLV4tRFhMs1lkct+gawBsQNEA0oGrAngG/WpKWrpbJlpMtN1mesXxhNdAq2kphtcrqqFXXQLOBoQOLBi4feGhgp7WJdYi11Hq59WHrP/im/DC+jF/DP8bvtrG0ibFR22y0OWvzztbJNs12lu0u29t2HDt/u3y75XZtdt321vYj7afY19v/6sB28HcodFjpcMLhlaOTY4bj145Njo+c+jvFOlU41TvdctZ3Hu483rnO+bIL08Xfpdhlrct5V9LVx7XQtdb1nBvp5usmdVvrdmEQY1DAIPmgukHX3PXcw9zL3evd7w42Gxw/eNbgpsFPhtgPyR6yZMiJIR89fDxkHps9bg41Hjpi6KyhLUOfebp6ijxrPS976XtFeU33avZ66u3mLfFe533dx8RnpM/XPm0+H3z9fJW+Db6dfvZ+uX5r/K758/yT/Bf4nwxgBIQHTA84EPAm0DdQFbgn8K8g96DioB1Bj4Y5DZMM2zzsfrBtsDB4Y3B7CD8kN2RDSPtwm+HC4XXD74XahYpDt4Q+DHMJKwrbGfYk3CNcGb4v/JUgUDBV0BpBRURHVEWcjTSOTItcHXknyjaqIKo+qjvaJ3pydGsMIyYuZknMtVirWFHs9tjuEX4jpo44FqcXlxK3Ou5evGu8Mr5lJDlyxMhlI28lOCTIE5oSkRibuCzxdpJT0vikH0cxRyWNqh31IHlo8pTkEykmKeNSdqS8TA1PXZR6M805TZ3Wls5Nz0nfnv4qIyJjaUZ75pDMqZmnsyyypFnN2azs9Owt2S9GR45eMbojxyenMufqGKcxE8ecGmsxVjb24DjuOOG4vbmM3IzcHbnvhYnCOuGLvNi8NXndIoFopeixOFS8XNwpCZYslTzMD85fmv+oILhgWUFn4fDC6sIuqUC6Wvq0KKZofdGr4sTircU9sgzZrhKdktyS/XJjebH8WOnA0omlFxRuikpF+/jA8SvGdyvjlFvKiLIxZc0qnkqhOqN2Vn+lvlseUl5b/npC+oS9E40myieemeQ6ad6khxVRFd9OpieLJrdNsZkyc8rdqWFTN04jpuVNa5tuN33O9I4Z0TO2zeTMLJ75yyyPWUtn/T07Y3bLHKs5M+bc/yr6q/pKg0pl5bWvg75eP5eeK517dp7XvFXzPlaJq36e7zG/ev77BaIFP38z9Juab3oW5i88u8h30brFzMXyxVeXDF+ybanR0oql95eNXNa4nL+8avnfK8atOFXtXb1+JWelemV7TXxN8yr7VYtXvV9duPpKbXjtrjWWa+atebVWvPbiutB1Deut1s9f/3aDdMP1jdEbG+sc66o3MTeVb3qwOX3ziW/9v92+xWLL/C0ftsq3tm9L3nZsu9/27TssdyyqJ+vV9Z07c3ae/y7iu+YG94aNu8x2zd+N3erdf3yf+/3VPXF72vb67234weGHNftM9lU1Eo2TGrubCpvam7OaL+wfsb+tJahl34+Df9x6wOZA7UHTg4sOcQ7NOdRzuOLwi1ZFa9eRgiP328a13TyaefTysVHHzh6PO37yp6ifjp4IO3H4ZPDJA6cCT+3/2f/nptO+pxvP+JzZ94vPL/vO+p5tPOd3rvl8wPmWC8MuHLo4/OKRSxGXfroce/n0lYQrF66mXb1+Leda+3Xx9Uc3ZDee/lr+67ubM24xblXdNrxdfcfyTt1vLr/tavdtP3g34u6Zeyn3bt4X3X/8e9nv7zvmPNB/UP3Q+uH2R56PDnRGdZ7/Y/QfHY8Vj991Vf5p9OeaJ85Pfvgr9K8z3ZndHU+VT3ueLXhu/nzr395/t71IenHnZcnLd6+qXpu/3vbG/82JtxlvH76b8J71vuaDy4eWj3Efb/WU9PQohEohAIACQObnA8+2AvpZgMl5gDNaswsCAAjN/gpo/oP8Z1+zLwIAfIEGHjCqCxBcA3ZvBhzzAW4OkKQPpAaA9PLq+2itLN/LU6OlFw4w7vT0PHcEWMuAD4t7et7V9fR82ARQt4BWuWYHBQCmIbAh6UNeSR7+g2n20896/PIESC8vb3x5/gtE7pDo2tisBwAAAAlwSFlzAAALEwAACxMBAJqcGAAAB1ppVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDAyIDc5LjE2NDQ2MCwgMjAyMC8wNS8xMi0xNjowNDoxNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjIgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIyLTA3LTExVDIyOjU3OjM5KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIyLTA3LTEyVDIyOjAxOjA5KzAxOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0wNy0xMlQyMjowMTowOSswMTowMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozMzQ5OTY4NC1kNTE2LTQ1Y2YtYjE5OC0wYzI4OTAwNTA1YTkiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDpmMTg3M2JhNi1jMTgwLWMyNDQtYTg4Yi0xODdlZTc5YTdmMjEiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDplZjFkNTBhMi03NGQwLTQ1NzktOGQ1My0wYTM5YWUyMjYxMTciIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0iRGlzcGxheSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZWYxZDUwYTItNzRkMC00NTc5LThkNTMtMGEzOWFlMjI2MTE3IiBzdEV2dDp3aGVuPSIyMDIyLTA3LTExVDIyOjU3OjM5KzAxOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoTWFjaW50b3NoKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZjMwMWE3ZWItNmQ4NC00MjU0LWI1NDMtOTg0N2FhYTRiOTcwIiBzdEV2dDp3aGVuPSIyMDIyLTA3LTExVDIyOjU3OjM5KzAxOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MzM0OTk2ODQtZDUxNi00NWNmLWIxOTgtMGMyODkwMDUwNWE5IiBzdEV2dDp3aGVuPSIyMDIyLTA3LTEyVDIyOjAxOjA5KzAxOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPHBob3Rvc2hvcDpEb2N1bWVudEFuY2VzdG9ycz4gPHJkZjpCYWc+IDxyZGY6bGk+YWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjJkOTM5Y2M5LWI5NmItODg0My04NzU0LWUxOWUzMWJiMGYwZTwvcmRmOmxpPiA8L3JkZjpCYWc+IDwvcGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PllZkKIAAAB/SURBVBiVbc8xbsJAAETRISAokRAFFV2iVJyBipKSc3Gxtdde3+elMYggfjlfv5jUWgWCAywgSb76vk+Se7A301oTLHGepgnWzyZJxnFMuq7zwi24PHosg1UpBa7YvCf/KKUIdrXWjxLHYIvvYRje5QmLYD1//WmtPeTvvG3+ABsI0D3M/KwaAAAAAElFTkSuQmCC");background-repeat:no-repeat;background-position:center center;opacity:.5}.collapsed>.e{-webkit-transform:rotate(-90deg);width:18px;height:20px;left:0;top:0}.e:hover{opacity:1}.e:active{opacity:.5}.blockInner{padding-left:24px;border-left:1px dotted #bbb;margin-left:2px}#formattedJson,#jsonpCloser,#jsonpOpener{color:#333;font:13px/18px monospace}#formattedJson{padding-left:28px;padding-top:6px;color:#444}.b{color:#fff!important}.s{color:#ce9178;word-wrap:break-word}a:link,a:visited{text-decoration:underline;color:inherit}a:active,a:hover{text-decoration:underline;color:#4e94ce}.bl,.n,.nl{color:#569cd6}.k{color:#9cdcfe!important}#formattingMsg{font:13px "Lucida Grande","Segoe UI",Tahoma;padding:10px 0 0 8px;margin:0;color:#333}#formattingMsg>svg{margin:0 7px;position:relative;top:1px}[hidden]{display:none!important}span{white-space:pre-wrap}@-webkit-keyframes spin{from{-webkit-transform:rotate(0)}to{-webkit-transform:rotate(360deg)}}#spinner{-webkit-animation:2s 0 infinite spin}*{-webkit-font-smoothing:antialiased}'
          );
        } else {
          jfStyleEl.insertAdjacentHTML(
            "beforeend",
            '#optionBar,.blockInner,.e,.kvov{display:block}.b,.bl,.n,.nl{font-weight:700}body{-webkit-user-select:text;overflow-y:scroll!important;margin:0;position:relative}#optionBar{-webkit-user-select:none;position:absolute;top:9px;right:17px}#buttonFormatted,#buttonPlain{-webkit-border-radius:2px;-webkit-box-shadow:0 1px 3px rgba(0,0,0,.1);-webkit-user-select:none;background:-webkit-linear-gradient(#fafafa,#f4f4f4 40%,#e5e5e5);border:1px solid #aaa;color:#444;font-size:12px;margin-bottom:0;min-width:4em;padding:3px 0;position:relative;z-index:10;display:inline-block;width:80px;text-shadow:1px 1px rgba(255,255,255,.3)}#buttonFormatted{margin-left:0;border-top-left-radius:0;border-bottom-left-radius:0}#buttonPlain{margin-right:0;border-top-right-radius:0;border-bottom-right-radius:0;border-right:none}#buttonFormatted:hover,#buttonPlain:hover{-webkit-box-shadow:0 1px 3px rgba(0,0,0,.2);background:-webkit-linear-gradient(#fefefe,#f8f8f8 40%,#e9e9e9) #ebebeb;border-color:#999;color:#222}#buttonFormatted:active,#buttonPlain:active{-webkit-box-shadow:inset 0 1px 3px rgba(0,0,0,.2);background:-webkit-linear-gradient(#f4f4f4,#efefef 40%,#dcdcdc) #ebebeb;color:#333}#buttonFormatted.selected,#buttonPlain.selected{-webkit-box-shadow:inset 0 1px 5px rgba(0,0,0,.2);background:-webkit-linear-gradient(#e4e4e4,#dfdfdf 40%,#dcdcdc) #ebebeb;color:#333}#buttonFormatted:focus,#buttonPlain:focus{outline:0}#jsonpCloser,#jsonpOpener{padding:4px 0 0 8px;margin-bottom:-6px}#jsonpCloser{margin-top:0}pre{padding:36px 5px 5px}.kvov{padding-left:20px;margin-left:-20px;position:relative}.collapsed{white-space:nowrap}.collapsed .kvov .e,.collapsed>.blockInner{display:none}.collapsed>.ell:after{content:"…";font-weight:700}.collapsed>.ell{margin:0 4px;color:#888}.collapsed .kvov{display:inline}.e{width:20px;height:18px;position:absolute;left:-2px;top:1px;z-index:5;background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD1JREFUeNpiYGBgOADE%2F3Hgw0DM4IRHgSsDFOzFInmMAQnY49ONzZRjDFiADT7dMLALiE8y4AGW6LoBAgwAuIkf%2F%2FB7O9sAAAAASUVORK5CYII%3D");background-repeat:no-repeat;background-position:center center;opacity:.15}.collapsed>.e{-webkit-transform:rotate(-90deg);width:18px;height:20px;left:0;top:0}.e:hover{opacity:.35}.e:active{opacity:.5}.blockInner{padding-left:24px;border-left:1px dotted #bbb;margin-left:2px}#formattedJson,#jsonpCloser,#jsonpOpener{color:#333;font:13px/18px monospace}#formattedJson{padding-left:28px;padding-top:6px;color:#444}.s{color:#0b7500;word-wrap:break-word}a:link,a:visited{text-decoration:none;color:inherit}a:active,a:hover{text-decoration:underline;color:#050}.bl,.n,.nl{color:#1a01cc}.k{color:#000!important}#formattingMsg{font:13px "Lucida Grande","Segoe UI",Tahoma;padding:10px 0 0 8px;margin:0;color:#333}#formattingMsg>svg{margin:0 7px;position:relative;top:1px}[hidden]{display:none!important}span{white-space:pre-wrap}@-webkit-keyframes spin{from{-webkit-transform:rotate(0)}to{-webkit-transform:rotate(360deg)}}#spinner{-webkit-animation:2s 0 infinite spin}*{-webkit-font-smoothing:antialiased}'
          );
        }

        // Add custom font name if set - FROM FUTURE
        // if (typeof settings.fontName === 'string') {
        //   jfStyleEl.insertAdjacentHTML(
        //     'beforeend',
        //     '#formattedJson,#jsonpOpener,#jsonpCloser{font-family: "' + settings.fontName + '"}'
        //   ) ;
        // }

        // Show 'Formatting...' spinner
        // jfContent.innerHTML = '<p id="formattingMsg"><img src="data:image/gif;base64,R0lGODlhEAALAPQAAP%2F%2F%2FwAAANra2tDQ0Orq6gYGBgAAAC4uLoKCgmBgYLq6uiIiIkpKSoqKimRkZL6%2BviYmJgQEBE5OTubm5tjY2PT09Dg4ONzc3PLy8ra2tqCgoMrKyu7u7gAAAAAAAAAAACH%2BGkNyZWF0ZWQgd2l0aCBhamF4bG9hZC5pbmZvACH5BAALAAAAIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh%2BQQACwABACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5%2By967tYLyicBYE7EYkYAgAh%2BQQACwACACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W%2FHISxGBzdHTuBNOmcJVCyoUlk7CEAAh%2BQQACwADACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ%2BYrBH%2BhWPzJFzOQQaeavWi7oqnVIhACH5BAALAAQALAAAAAAQAAsAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkEAAsABQAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C%2B4FIIACH5BAALAAYALAAAAAAQAAsAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa%2F7txxwlwv2isSacYUc%2Bl4tADQGQ1mvpBAAIfkEAAsABwAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r%2Fu3HHCXC%2FaKxJpxhRz6Xi0ANAZDWa%2BkEAA7AAAAAAAAAAAA"> Formatting...</p>' ;
        // jfContent.innerHTML = '<p id="formattingMsg">Formatting...<br><progress/></p>' ;
        jfContent.innerHTML =
          '<p id="formattingMsg"><svg id="spinner" width="16" height="16" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" version="1.1"><path d="M 150,0 a 150,150 0 0,1 106.066,256.066 l -35.355,-35.355 a -100,-100 0 0,0 -70.711,-170.711 z" fill="#3d7fe6"></path></svg> Formatting...</p>';

        let formattingMsg = document.getElementById("formattingMsg");
        // TODO: set formattingMsg to visible after about 300ms (so faster than this doesn't require it)
        formattingMsg.hidden = true;
        setTimeout(function () {
          formattingMsg.hidden = false;
        }, 250);

        // Create option bar
        let optionBar = document.createElement("div");
        optionBar.id = "optionBar";

        // Show options link, if needed - FROM FUTURE
        // if (settings.enableOptionsLink) {
        //   var optionsLink = document.createElement('a') ;
        //   optionsLink.id = 'optionsLink' ;
        //   optionsLink.innerText = 'Options' ;
        //   optionsLink.href = settings['optionsUrl'] ;
        //   optionsLink.target = '_BLANK' ;
        //   optionBar.appendChild(optionsLink) ;
        // }

        // Create toggleFormat button
        let buttonPlain = document.createElement("button"),
          buttonFormatted = document.createElement("button");
        buttonPlain.id = "buttonPlain";
        buttonPlain.innerText = "Raw";
        buttonFormatted.id = "buttonFormatted";
        buttonFormatted.innerText = "Parsed";
        buttonFormatted.classList.add("selected");

        let plainOn = false;
        buttonPlain.addEventListener(
          "click",
          function () {
            // When plain button clicked...
            if (!plainOn) {
              plainOn = true;
              pre.hidden = false;
              jfContent.hidden = true;

              buttonFormatted.classList.remove("selected");
              buttonPlain.classList.add("selected");
            }
          },
          false
        );

        buttonFormatted.addEventListener(
          "click",
          function () {
            // When formatted button clicked...
            if (plainOn) {
              plainOn = false;
              pre.hidden = true;
              jfContent.hidden = false;

              buttonFormatted.classList.add("selected");
              buttonPlain.classList.remove("selected");
            }
          },
          false
        );

        // Put it in optionBar
        optionBar.appendChild(buttonPlain);
        optionBar.appendChild(buttonFormatted);

        // Attach event handlers
        document.addEventListener(
          "click",
          generalClick,
          false // No need to propogate down
        );

        // Put option bar in DOM
        document.body.insertBefore(optionBar, pre);

        break;

      case "FORMATTED":
        // Insert HTML content
        jfContent.innerHTML = msg[1];

        displayedFormattedJsonTime = Date.now();

        // Log times
        //console.log('DOM ready took '+ (domReadyTime - startTime) +'ms' ) ;
        //console.log('Confirming as JSON took '+ (isJsonTime - domReadyTime) +'ms' ) ;
        //console.log('Formatting & displaying JSON took '+ (displayedFormattedJsonTime - isJsonTime) +'ms' ) ;
        // console.log('JSON detected and formatted in ' + ( displayedFormattedJsonTime - domReadyTime ) + ' ms') ;
        // console.markTimeline('JSON formatted and displayed') ;

        // Export parsed JSON for easy access in console
        setTimeout(function () {
          var script = document.createElement("script");
          script.innerHTML = "window.json = " + msg[2] + ";";
          document.head.appendChild(script);
          console.log('JSON Formatter: Type "json" to inspect.');
        }, 100);

        break;

      default:
        throw new Error("Message not understood: " + msg[0]);
    }
  });

  // console.timeEnd('established port') ;

  function ready() {
    domReadyTime = Date.now();

    // First, check if it's a PRE and exit if not
    var bodyChildren = document.body.childNodes;
    pre = bodyChildren[0];
    var jsonLength = ((pre && pre.innerText) || "").length;
    if (
      bodyChildren.length !== 1 ||
      pre.tagName !== "PRE" ||
      jsonLength > 3000000
    ) {
      // console.log('Not even text (or longer than 3MB); exiting') ;
      // console.log(bodyChildren.length,pre.tagName, pre.innerText.length) ;

      // Disconnect the port (without even having used it)
      port.disconnect();

      // EXIT POINT: NON-PLAIN-TEXT PAGE (or longer than 3MB)
    } else {
      // This is a 'plain text' page (just a body with one PRE child).
      // It might be JSON/JSONP, or just some other kind of plain text (eg CSS).

      // Hide the PRE immediately (until we know what to do, to prevent FOUC)
      pre.hidden = true;
      //console.log('It is text; hidden pre at ') ;
      slowAnalysisTimeout = setTimeout(function () {
        pre.hidden = false;
      }, 1000);

      // Send the contents of the PRE to the BG script
      // Add jfContent DIV, ready to display stuff
      jfContent = document.createElement("div");
      jfContent.id = "jfContent";
      document.body.appendChild(jfContent);

      // Post the contents of the PRE
      port.postMessage({
        type: "SENDING TEXT",
        text: pre.innerText,
        length: jsonLength,
      });

      // Now, this script will just wait to receive anything back via another port message. The returned message will be something like "NOT JSON" or "IS JSON"
    }

    document.addEventListener("keyup", function (e) {
      if (e.keyCode === 37 && typeof buttonPlain !== "undefined") {
        buttonPlain.click();
      } else if (e.keyCode === 39 && typeof buttonFormatted !== "undefined") {
        buttonFormatted.click();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", ready, false);

  var lastKvovIdGiven = 0;
  function collapse(elements) {
    // console.log('elements', elements) ;

    var el, i, blockInner, count;

    for (i = elements.length - 1; i >= 0; i--) {
      el = elements[i];
      el.classList.add("collapsed");

      // (CSS hides the contents and shows an ellipsis.)

      // Add a count of the number of child properties/items (if not already done for this item)
      if (!el.id) {
        el.id = "kvov" + ++lastKvovIdGiven;

        // Find the blockInner
        blockInner = el.firstElementChild;
        while (blockInner && !blockInner.classList.contains("blockInner")) {
          blockInner = blockInner.nextElementSibling;
        }
        if (!blockInner) continue;

        // See how many children in the blockInner
        count = blockInner.children.length;

        // Generate comment text eg "4 items"
        var comment = count + (count === 1 ? " item" : " items");
        // Add CSS that targets it
        jfStyleEl.insertAdjacentHTML(
          "beforeend",
          "\n#kvov" +
            lastKvovIdGiven +
            '.collapsed:after{color: #aaa; content:" // ' +
            comment +
            '"}'
        );
      }
    }
  }
  function expand(elements) {
    for (var i = elements.length - 1; i >= 0; i--)
      elements[i].classList.remove("collapsed");
  }

  var mac = navigator.platform.indexOf("Mac") !== -1,
    modKey;
  if (mac)
    modKey = function (ev) {
      return ev.metaKey;
    };
  else
    modKey = function (ev) {
      return ev.ctrlKey;
    };

  function generalClick(ev) {
    // console.log('click', ev) ;

    if (ev.which === 1) {
      var elem = ev.target;

      if (elem.className === "e") {
        // It's a click on an expander.

        ev.preventDefault();

        var parent = elem.parentNode,
          div = jfContent,
          prevBodyHeight = document.body.offsetHeight,
          scrollTop = document.body.scrollTop,
          parentSiblings;

        // Expand or collapse
        if (parent.classList.contains("collapsed")) {
          // EXPAND
          if (modKey(ev)) expand(parent.parentNode.children);
          else expand([parent]);
        } else {
          // COLLAPSE
          if (modKey(ev)) collapse(parent.parentNode.children);
          else collapse([parent]);
        }

        // Restore scrollTop somehow
        // Clear current extra margin, if any
        div.style.marginBottom = 0;

        // No need to worry if all content fits in viewport
        if (document.body.offsetHeight < window.innerHeight) {
          // console.log('document.body.offsetHeight < window.innerHeight; no need to adjust height') ;
          return;
        }

        // And no need to worry if scrollTop still the same
        if (document.body.scrollTop === scrollTop) {
          // console.log('document.body.scrollTop === scrollTop; no need to adjust height') ;
          return;
        }

        // console.log('Scrolltop HAS changed. document.body.scrollTop is now '+document.body.scrollTop+'; was '+scrollTop) ;

        // The body has got a bit shorter.
        // We need to increase the body height by a bit (by increasing the bottom margin on the jfContent div). The amount to increase it is whatever is the difference between our previous scrollTop and our new one.

        // Work out how much more our target scrollTop is than this.
        var difference = scrollTop - document.body.scrollTop + 8; // it always loses 8px; don't know why

        // Add this difference to the bottom margin
        //var currentMarginBottom = parseInt(div.style.marginBottom) || 0 ;
        div.style.marginBottom = difference + "px";

        // Now change the scrollTop back to what it was
        document.body.scrollTop = scrollTop;

        return;
      }
    }
  }
})();
