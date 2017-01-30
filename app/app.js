/*
    MarkTogether

    A light, elegant, collaborative Markdown editor created by
    0xFireball and Joonatoona from CookieEaters (https://cookieeaters.xyz).

    This code is licensed under the Apache License 2.0
*/

/*jshint esversion: 6 */

let peer;
let isMaster = false;
let peerConnections = [];
let peerConnected = false;
let userModified = true;
let nextMaster;
let persistentIsMaster;

let codeMirrorOpts = {
    mode: "gfm",
    matchBrackets: true,
    theme: "3024-day",
    lineNumbers: true,
    scrollbarStyle: "simple",
    extraKeys: {
        "Alt-F": "findPersistent"
    }
};

// Initialize CodeMirror editor
let mdEditor = CodeMirror.fromTextArea($("#md-editor")[0], codeMirrorOpts);

mdEditor.on("change", function(cm, change) {
    //Editor modified event
    if (persistentIsMaster) {
        localStorage.setItem("savedFile", mdEditor.getValue());
    }
    updatePreview(mdEditor.getValue());
    if (userModified) {
        sendModifyRequest(peerConnections, change);
    }
});

$("#md-filename").change(() => {
    localStorage.setItem("savedFileName", $("#md-filename").val());
});

$("#navbar-save").click(() => {
    let fileName = $("#md-filename").val();
    saveFile(mdEditor.getValue(), fileName);
});

function onReceiveData(data) {
    console.log("Received request: ", data);
    let modifyRequest = JSON.parse(data);
    if (modifyRequest.type) {
        switch (modifyRequest.type) {
            case "modify-code":
                //Prevent echoing the request
                userModified = false;
                if (modifyRequest.contents.origin == "+delete" || modifyRequest.contents.origin == "cut") {
                    mdEditor.replaceRange("", modifyRequest.contents.from, modifyRequest.contents.to);
                }
                if (modifyRequest.contents.origin == "+input" || modifyRequest.contents.origin == "paste") {
                    if (modifyRequest.contents.from == modifyRequest.contents.to) {
                        mdEditor.replaceRange("\\n", modifyRequest.contents.from, modifyRequest.contents.to);
                    } else {
                        modifyRequest.contents.text.forEach((text) => {
                            mdEditor.replaceRange(text, modifyRequest.contents.from, modifyRequest.contents.to);
                        });
                    }
                }
                userModified = true;
                break;
            case "new-code":
                mdEditor.setValue(modifyRequest.contents);
                break;
            case "hello":
                if (isMaster) {
                    //Send current contents to new client
                    console.log("New client connected, sending contents.");
                    sendContents(peerConnections, mdEditor.getValue());
                    sendPeerData(peerConnections);
                }
                break;
        }
    }
}

function attemptConnection() {
    // Connect to CookieEaters PeerJS server
    peer = new Peer({
        host: "cookieeaters.xyz",
        port: 9002,
        path: "/peerjs",
        secure: true
    });

    // On server connect
    peer.on("open", function(id) {
        // Check if edit link
        if (getParameterByName('peerId') !== null) {
            //Connect to peer
            peerConnections = connectToPeer(getParameterByName('peerId'), peer, peerConnections);
        } else {
            //Host a document editing session
            console.log("Established connection to CookieEaters PeerJS server");
            $("#peerjs-status").text("Connected to server. Press the Share button to share your editor.");
            $("#peerjs-info").text("Give this link to another person to edit with them:");
            let currentUrl = window.location.href.split('?')[0];
            $("#peerjs-peer-id").val(currentUrl + "?peerId=" + id);
            $("#share-info-body").append(`<div class="panel panel-info"><div class="panel-heading"><h3 class="panel-title">Connected Peers</h3></div>
            <div class="panel-body" id="connected-peers"></div></div>`);
            isMaster = true;
            persistentIsMaster = true;
            let savedFileCont = localStorage.getItem("savedFile");
            if (savedFileCont) {
                mdEditor.setValue(savedFileCont);
            }
            let savedFileName = localStorage.getItem("savedFileName");
            if (savedFileName) {
                $("#md-filename").val(savedFileName);
            }
        }

        peer.on('connection', function(newConnection) {
            peerConnected = true;
            if (!nextMaster) {
                nextMaster = newConnection.peer;
            }
            peerConnections.push(newConnection);
            $("#connected-peers").append('<p id="' + newConnection.peer + '">' + newConnection.peer + '</p>');
            newConnection.on('data', function(data) {
                onReceiveData(data);
            });
        });
    });
}

// Do the stuff and things
attemptConnection();
displayAnnouncements();


if (!$("#md-filename").val()) {
    $("#md-filename").val("Document1.md");
}