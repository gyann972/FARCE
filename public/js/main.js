function  adaptePaperToScreen(){
	var MIN_HEIGHT = 200;
	var paper = document.getElementById('editor');
	var newHeight = window.innerHeight - paper.offsetTop - 60;
	paper.style.height = Math.max(MIN_HEIGHT, newHeight) + 'px';
}

window.addEventListener("load", adaptePaperToScreen, false);
window.addEventListener("resize", adaptePaperToScreen, false);

var editor;
var lseq;
var pbcast;


function initEditor(userName, documentTitle){
	//$('#registerSubmit').button('loading');
    if(userName==null || userName.length<=0 || documentTitle==null || documentTitle.length<=0)
        return;

    console.log("------------------- initEditor ------------------ 11");
	var serverAddress = "localhost"; //document.domain;
	var serverPort = "5000"; //window.location.port;
	//var userName = "lamine"; //($('#registerName').val().length > 0) ? $('#registerName').val() : 'NoName';
	//var documentTitle = "test"; // ($('#documentTitleAsked').val().length > 0) ? $('#documentTitleAsked').val() : 'untitled';
	//var isNewDocument = $('#newDocument').attr('checked') == 'checked';

    console.log("content dsa = "+currentFileContent);
    //readFile(documentTitle);

	var serverLocation = 'ws://' + serverAddress + ':' + serverPort;
	pbcast = new PBCast(serverLocation, {userName: userName, isNewDocument: false, documentTitle: documentTitle});
	pbcast.on('ready', function(data){
		$('#registerModal').modal('hide');
		$('<div class="addon pouet" id="' + data.id + '">' + data.name + '</div>')
			.hide().appendTo('#collaborators').fadeIn(300);

        var div = $('#collaborators');
		for(var i = 0; i < data.knownUsers.length; i++){

            var a = $('<a>'+data.knownUsers[i].name+'</a>');
            var p = $('<p></p>');
            p.append(a);
            p.append('<br/>');
            p.append('<muted>Available</muted>');
            var div1 = $('<div class="details"></div>');
            div1.append(p);
            var div2 = $('<div class="desc"></div>');
            div2.append('<div class="thumb"></div>');
            div2.append(div1);

            div.append(div2).fadeIn(300);
		}

		$('#documentTitle').text(data.documentTitle);

		editor = new Editor("editor");
		lseq = new LSEQ();

		pbcast.on('deliver', function(msg){
			lseq.onDelivery(msg);
		});
		
		lseq.on('edit', function(msg){
			pbcast.send(msg);
		});
		
		editor.on('edit', function(msg){
			pbcast.localSend(msg);
		});
		
		lseq.on('foreignDelete', function(msg){
			editor.delete(msg.offset);
		});
		
		lseq.on('foreignInsert', function(msg)	{
			editor.insert(msg.value, msg.offset);
		});

		pbcast.on('connectedUser', function(newUser){
			if($('#' + newUser.id).length < 1){
                var a = $('<a>'+newUser.name+'</a>');
                var p = $('<p></p>');
                p.append(a);
                p.append('<br/>');
                p.append('<muted>Available</muted>');
                var div1 = $('<div class="details"></div>');
                div1.append(p);
                var div2 = $('<div class="desc"></div>');
                div2.append('<div class="thumb"></div>');
                div2.append(div1);

                div.append(div2).fadeIn(300);
			}
		});

		pbcast.on('disconnectedUser', function(oldUser){
			if($('#' + oldUser.id).length > 0){
				$('#' + oldUser.id).fadeOut(300, function(){ 
					$(this).remove(); 
				}); 
			}
		});

        //currentFileContent = "MALABA";
        console.log("currentFileContent: "+currentFileContent);
        if(currentFileContent.length > 0){
            console.log(" llll ");
            var aceEditor = ace.edit("editor");
            //aceEditor.getSession().setValue(currentFileContent, -1);
            //aceEditor.navigateFileEnd();

            //pbcast.localSend(currentFileContent);
            for (i = 0; i < currentFileContent.length; i++) {
                //lseq.insert(i, currentFileContent[i], lseq.siteID, lseq._tree._getId(i).clock);
                //aceEditor.getSession().setValue(currentFileContent[i], 1);
                editor.insert(currentFileContent[i], i);
            }
        }
	});


}

$(document).ready(function(){
	/*$('#registerModal').modal({
		backdrop: 'static',
		keyboard: false,
		show: true 
	});
	$('#registerSubmit').click(register);
	$('#registerName').keyup(function(e){
		if(e.keyCode == 13){
			register(); 
		}
	});

	// initial focus 
	$('#registerAddress').focus(); */
});

