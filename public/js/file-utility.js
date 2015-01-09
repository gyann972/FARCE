//var currentFileContent = "";
window.onload = function () {
    // Allow for vendor prefixes.
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

    // Create a variable that will store a reference to the FileSystem.
    var filesystem = null;

    // A simple error handler to be used throughout this demo.
    function errorHandler(error) {
        var message = '';

        switch (error.code) {
            case FileError.SECURITY_ERR:
                message = 'Security Error';
                break;
            case FileError.NOT_FOUND_ERR:
                message = 'Not Found Error';
                break;
            case FileError.QUOTA_EXCEEDED_ERR:
                message = 'Quota Exceeded Error';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                message = 'Invalid Modification Error';
                break;
            case FileError.INVALID_STATE_ERR:
                message = 'Invalid State Error';
                break;
            default:
                message = 'Unknown Error';
                break;
        }

        console.log(message);
    }

    // Request a FileSystem and set the filesystem variable.
    function initFileSystem() {
        navigator.webkitPersistentStorage.requestQuota(1024 * 1024 * 5,
            function (grantedSize) {

                // Request a file system with the new size.
                window.requestFileSystem(window.PERSISTENT, grantedSize, function (fs) {

                    // Set the filesystem variable.
                    filesystem = fs;

                    // Setup event listeners on the form.
                    if(docId !=null && docId.length>0)
                        setupFormEventListener();

                    // Update the file browser.
                    listFiles();

                }, errorHandler);

            }, errorHandler);
    }

    function loadFile(filename) {
        filesystem.root.getFile(filename, {}, function (fileEntry) {

            fileEntry.file(function (file) {
                var reader = new FileReader();

                reader.onload = function (e) {
                    // Update the form fields.
                    //currentFileContent = this.result;
                };

                reader.readAsText(file);
            }, errorHandler);

        }, errorHandler);
    }

    function displayEntries(entries) {
        // Clear out the current file browser entries.
        var ul = $('#my_documents');
        var spanNum = $('#doc_number');
        var num = 0;
        entries.forEach(function (entry, i) {
            var div1 = $('<div class="desc green">'+entry.name+'</div>');
            var div2 = $('<div class="task-info"></div>');
            var a = $('<a></a>');
            var li = $('<li></li>');
            div2.append(div1);
            a.append(div2);
            a.click( function (e) {
                e.preventDefault();
                document.location.href = "#"+entry.name;
                location.reload();
            });

            li.append(a);
            ul.append(li);
            num++;
        });
        spanNum.text(num);
    }


    function listFiles() {
        var dirReader = filesystem.root.createReader();
        var entries = [];

        var fetchEntries = function () {
            dirReader.readEntries(function (results) {
                if (!results.length) {
                    displayEntries(entries.sort().reverse());
                } else {
                    entries = entries.concat(results);
                    fetchEntries();
                }
            }, errorHandler);
        };

        fetchEntries();
    }


    // Save a file in the FileSystem.
    function saveFile(filename, content) {
        console.log('saving.....');
        filesystem.root.getFile(filename, {create: true}, function (fileEntry) {

            fileEntry.createWriter(function (fileWriter) {

                fileWriter.onwriteend = function (e) {
                    // Update the file browser.
                    //listFiles();

                    // Clean out the form field.
                    //filenameInput.value = '';
                    // contentTextArea.value = '';

                    // Show a saved message.
                   console.log('File '+filename+' saved!');
                };

                fileWriter.onerror = function (e) {
                    console.log('Write error: ' + e.toString());
                    alert('An error occurred and your file could not be saved!');
                };

                var contentBlob = new Blob([content], {type: 'text/plain'});

                fileWriter.write(contentBlob);

            }, errorHandler);

        }, errorHandler);
    }


    function deleteFile(filename) {
        filesystem.root.getFile(filename, {create: false}, function (fileEntry) {

            fileEntry.remove(function (e) {
                // Update the file browser.
                listFiles();

                // Show a deleted message.
                messageBox.innerHTML = 'File deleted!';
            }, errorHandler);

        }, errorHandler);
    }


    // Add event listeners on the form.
    function setupFormEventListener() {

        setInterval(function(){
            var filename = docId;
            var editor = ace.edit("editor");
            var content = editor.getSession().getValue();

            saveFile(filename, content); }, 30000);

    }

    // Start the app by requesting a FileSystem (if the browser supports the API)
    if (window.requestFileSystem) {
        initFileSystem();
    } else {
        alert('Sorry! Your browser doesn\'t support the FileSystem API :(');
    }
};
