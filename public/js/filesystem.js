var currentFileContent = "";
var MFileSystem = new function MFileSystem() {
    // Allow for vendor prefixes.
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

    // Create a variable that will store a reference to the FileSystem.
    //MFileSystem.content = "none";

    this.initFileSystem = function () {
        console.log("testt123 ");
        if (window.requestFileSystem){
            console.log("okkkkkkk ");
            navigator.webkitPersistentStorage.requestQuota(1024 * 1024 * 5,
                function (grantedSize) {

                    // Request a file system with the new size.
                    window.requestFileSystem(window.PERSISTENT, grantedSize, function (fs) {

                        // Set the filesystem variable.
                        MFileSystem.filesystem = fs;

                        // Setup event listeners on the form.
                        if (docId != null && docId.length > 0)
                            MFileSystem.setupFormEventListener();

                        // Update the file browser.
                        MFileSystem.listFiles();

                    }, errorHandler);

                }, errorHandler);
        }
    }

    MFileSystem.loadFile = function (filename) {
        console.log("loadFile= "+filename);
        MFileSystem.filesystem.root.getFile(filename, {}, function (fileEntry) {

            fileEntry.file(function (file) {
                var reader = new FileReader();

                reader.onload = function (e) {
                    // Update the form fields.
                    currentFileContent = this.result;
                };

                reader.readAsText(file);
            }, errorHandler);

        }, errorHandler);
    }

    MFileSystem.displayEntries = function (entries) {
        // Clear out the current file browser entries.
        var ul = $('#my_documents');
        var spanNum = $('#doc_number');
        var num = 0;
        entries.forEach(function (entry, i) {
            var div1 = $('<div class="desc green">' + entry.name + '</div>');
            var div2 = $('<div class="task-info"></div>');
            var a = $('<a></a>');
            var li = $('<li></li>');
            div2.append(div1);
            a.append(div2);
            a.click(function (e) {
                e.preventDefault();
                document.location.href = "#" + entry.name;
                location.reload();
            });

            li.append(a);
            ul.append(li);
            num++;
        });
        spanNum.text(num);
    }


    MFileSystem.listFiles = function () {
        var dirReader = MFileSystem.filesystem.root.createReader();
        var entries = [];

        var fetchEntries = function () {
            dirReader.readEntries(function (results) {
                if (!results.length) {
                    MFileSystem.displayEntries(entries.sort().reverse());
                } else {
                    entries = entries.concat(results);
                    fetchEntries();
                }
            }, errorHandler);
        };

        fetchEntries();
    }
    // Save a file in the FileSystem.
    MFileSystem.saveFile = function (filename, content) {
        console.log('saving.....');
        MFileSystem.filesystem.root.getFile(filename, {create: true}, function (fileEntry) {

            fileEntry.createWriter(function (fileWriter) {

                fileWriter.onwriteend = function (e) {
                    // Show a saved message.
                    console.log('File ' + filename + ' saved!');
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
    // Add event listeners on the form.
    MFileSystem.setupFormEventListener = function () {
        MFileSystem.loadFile(docId);

        setInterval(function () {
            var filename = docId;
            var editor = ace.edit("editor");
            var content = editor.getSession().getValue();

            MFileSystem.saveFile(filename, content);
        }, 5000);

    }
};

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
