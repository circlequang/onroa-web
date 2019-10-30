$("#upload").fileinput({
	showUpload: false,
	showCaption: false,
	browseClass: "btn btn-primary btn-lg",
	fileType: "any",
	browseLabel: "Tải hình ảnh",
	previewFileIcon: "<i class='glyphicon glyphicon-king'></i>",
	allowedFileExtensions: ["jpg", "png", "gif"]
});

$('.img-wrap .close').on('click', function() {
    var id = $(this).closest('.img-wrap').find('img').data('id');
    alert('remove picture: ' + id);
});

function removeAvatar(id) {
	alert("remove" + id);
	var el = document.getElementById( 'cam_id_' + id );
	el.parentNode.removeChild( el );
}
