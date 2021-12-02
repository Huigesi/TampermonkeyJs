// ==UserScript==
// @name         Vlive-Video
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  get video link
// @compatible          chrome
// @compatible          firefox
// @compatible          edge
// @author       KuaiLeQuan
// @match        https://www.vlive.tv/post/*
// @include      https://www.vlive.tv/video/*
//@include      https://www.vlive.tv/channel/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==
(function() {
    'use strict';
    // Your code here...
    const attachLink = true;
    const _historyWrap = function(type) {
        const orig = history[type];
        const e = new Event(type);
        return function() {
            const rv = orig.apply(this, arguments);
            e.arguments = arguments;
            window.dispatchEvent(e);
            return rv;
        };
    };
    history.pushState = _historyWrap('pushState');
    history.replaceState = _historyWrap('replaceState');

    var checkExistTimer = setTimeout(function () {
        if(document.getElementsByClassName("download-btn").length === 0){
            let x = document.getElementsByClassName("post_detail_reaction_info--2nGeq")
            x[0].appendChild(createCustomBtn(svgDownloadBtn, "black", "download-btn", "14px"));
        }
    }, 500);

    window.addEventListener('pushState', function(e) {
        if(JSON.stringify(e.arguments[2]).indexOf("channel")===-1){
            var checkExistTimer = setTimeout(function () {
                if(document.getElementsByClassName("download-btn").length === 0){
                    let x = document.getElementsByClassName("post_detail_reaction_info--2nGeq")
                    x[0].appendChild(createCustomBtn(svgDownloadBtn, "black", "download-btn", "14px"));
                }
            }, 500);

        }
    });
    window.addEventListener('replaceState', function(e) {
        console.log('change replaceState');
    });
    function getVariable()
    {
        var query = window.location.href;
        var vars = query.split("/").pop();
        return vars;
    }
    const videoid=getVariable();
    var svgDownloadBtn =
        `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" height="20" width="20"
	 viewBox="0 0 477.867 477.867" style="fill:%color;" xml:space="preserve">
	<g>
		<path d="M443.733,307.2c-9.426,0-17.067,7.641-17.067,17.067v102.4c0,9.426-7.641,17.067-17.067,17.067H68.267
			c-9.426,0-17.067-7.641-17.067-17.067v-102.4c0-9.426-7.641-17.067-17.067-17.067s-17.067,7.641-17.067,17.067v102.4
			c0,28.277,22.923,51.2,51.2,51.2H409.6c28.277,0,51.2-22.923,51.2-51.2v-102.4C460.8,314.841,453.159,307.2,443.733,307.2z"/>
	</g>
	<g>
		<path d="M335.947,295.134c-6.614-6.387-17.099-6.387-23.712,0L256,351.334V17.067C256,7.641,248.359,0,238.933,0
			s-17.067,7.641-17.067,17.067v334.268l-56.201-56.201c-6.78-6.548-17.584-6.36-24.132,0.419c-6.388,6.614-6.388,17.099,0,23.713
			l85.333,85.333c6.657,6.673,17.463,6.687,24.136,0.031c0.01-0.01,0.02-0.02,0.031-0.031l85.333-85.333
			C342.915,312.486,342.727,301.682,335.947,295.134z"/>
	</g>
</svg>`;


    addXMLRequestCallback( function( xhr ) {
        xhr.addEventListener("load", function(){
            if ( xhr.readyState == 4 && xhr.status == 200 ) {
                if(xhr.responseURL.indexOf('/rmcnmv/vod/play')!==-1){
                    let list=JSON.parse(xhr.response)

                    let url=arrayMax(list.videos.list).source
                    GM_setValue('video_url'+videoid,url)
                }
            }
        });
    });

    function arrayMax(arrs){
        var min = arrs[0];
        for(var i = 1, ilen = arrs.length; i < ilen; i+=1) {
            if(arrs[i] < min) {
                min = arrs[i];
            }
        }
        return min;
    }
    function createCustomBtn(svg, iconColor, className, marginLeft) {
        let newBtn = document.createElement("button");
        newBtn.innerHTML = svg.replace('%color', iconColor);
        newBtn.setAttribute("class", "custom-btn " + className+" bookmark_button--98XW4");
        newBtn.setAttribute("target", "_blank");
        newBtn.onclick = onClickHandler;
        newBtn.setAttribute("title", "Download");
        return newBtn;
    }
    function onClickHandler(e) {
        // handle button click
        let target = e.currentTarget;
        e.stopPropagation();
        e.preventDefault();
        let url=GM_getValue('video_url'+videoid)
        openResource(url)
    }
    function openResource(url) {
        // open url in new tab
        var a = document.createElement('a');
        a.href = url;
        a.setAttribute("target", "_blank");
        document.body.appendChild(a);
        a.click();
        a.remove();
    }


    function addXMLRequestCallback(callback){
        var oldSend, i;
        if( XMLHttpRequest.callbacks ) {
            // we've already overridden send() so just add the callback
            XMLHttpRequest.callbacks.push( callback );
        } else {
            // create a callback queue
            XMLHttpRequest.callbacks = [callback];
            // store the native send()
            oldSend = XMLHttpRequest.prototype.send;
            // override the native send()
            XMLHttpRequest.prototype.send = function(){
                // process the callback queue
                // the xhr instance is passed into each callback but seems pretty useless
                // you can't tell what its destination is or call abort() without an error
                // so only really good for logging that a request has happened
                // I could be wrong, I hope so...
                // EDIT: I suppose you could override the onreadystatechange handler though
                for( i = 0; i < XMLHttpRequest.callbacks.length; i++ ) {
                    XMLHttpRequest.callbacks[i]( this );
                }
                // call the native send()
                oldSend.apply(this, arguments);
            }
        }
    }
    window.onbeforeunload = function(){
        GM_deleteValue('video_url'+videoid)
    }
})();
