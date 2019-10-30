$(document).on('ready', function() {
	$("#upload").fileinput({
		showUpload: false,
		showCaption: false,
		browseClass: "btn btn-primary btn-lg",
		fileType: "any",
		browseLabel: " ",
		previewFileIcon: "<i class='glyphicon glyphicon-king'></i>",
		allowedFileExtensions: ["jpg", "png", "gif"]
	});

});