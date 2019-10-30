//Xóa các dữ liệu tạm lưu trong  localStorage
length = window.localStorage.length;
for(i = 0; i < length; i++) {
	name = window.localStorage.key(i);
	index = name.search("cmt_");
	if(index >= 0) window.localStorage.removeItem(name);
}

function changeToEdit(id){
	
	re_id = "re_" + id;
	cmt_id = "cmt_" + id;
	dbtn_id = "dbtn_" + id;
	form_id = "form_" + id;
	text_id = "text_" + id
    
	data = document.getElementById(cmt_id).innerHTML;
	window.localStorage.setItem(cmt_id, data);
	
	data = '<div id="' + cmt_id +'">' +
			'<textarea class="form-control" id="' + text_id +'" name="' + text_id + '"  rows="3" cols="30" required="">' + 
			data + 
			'</textarea>' +
			'</div>';

	document.getElementById(cmt_id).innerHTML = data;
	str = document.getElementById(re_id).innerHTML;
	str = '<form class="edit_cmt" id="' + form_id + '">' + str +
		  '</form>';
	document.getElementById(re_id).innerHTML = str;
	document.getElementById(dbtn_id).innerHTML = '<a onclick="submitForm(\'' + id + '\')" href="javascript:void(0);"><img src="/assets/img/icon/save.png" alt="Save" height="16" width="16"></a>&nbsp;&nbsp;&nbsp;&nbsp; ' +  
												'<a onclick="cancelSubmit(\'' + id + '\')" href="javascript:void(0);"><img src="/assets/img/icon/cancel.png" alt="Cancel" height="16" width="16"></a>';
	return false;
}


function submitForm(id){
	review_id = "rid_" + id;
	cmt_id = "cmt_" + id;
	dbtn_id = "dbtn_" + id;
	form_id = "form_" + id;
	text_id = "text_" + id;
	re_id = "re_" + id;
	
	cmt = document.getElementById(text_id).value;
	review_id = document.getElementById(review_id).value;
	pid = document.getElementById("pid").value;
	csrf = window.localStorage.getItem('_onroa.csrf');
	Meteor.call('editcmt', csrf, pid, review_id, cmt, function (error, result) {
		if(result == true) {
				//Đổi textarea thành div
				str = '<div id="cmt_' + id +'">' + cmt +'</div>' +
						'<input type="hidden" id="rid_' + id +'" name="rid_' + id +'" value="' + review_id + '">';
				document.getElementById(re_id).innerHTML = str;
				
				//Trả lại nguyên bản cho phần button
				document.getElementById(dbtn_id).innerHTML = '<a onclick="changeToEdit(\'' + id + '\')" href="javascript:void(0);"><img src="/assets/img/icon/edit.png" alt="Edit" height="16" width="16"></a>&nbsp;&nbsp;&nbsp;&nbsp;' +
													'<a onclick="deletecmt(\'' + id + '\')" href="javascript:void(0);"><img src="/assets/img/icon/delete.png" alt="Delete" height="16" width="16"></a>';
			}  else {
				//alert('khong thanh cong');
				jAlert('Cập nhật không thành công, xin hãy thử lại', 'Thông báo');
			}
		});
	
	return false;
}

 
function cancelSubmit(id){
	review_id = "rid_" + id;
	cmt_id = "cmt_" + id;
	dbtn_id = "dbtn_" + id;
	form_id = "form_" + id;
	text_id = "text_" + id
	re_id = "re_" + id;
	
	
	
	//Trả lại nguyên bản cho phần text
	review_id = document.getElementById(review_id).value;
	data = window.localStorage.getItem(cmt_id);
	
	str = '<div id="cmt_' + id +'">' + data +'</div>' +
			'<input type="hidden" id="rid_' + id +'" name="rid_' + id +'" value="' + review_id + '">';
	document.getElementById(re_id).innerHTML = str;
	
	//Trả lại nguyên bản cho phần button
	document.getElementById(dbtn_id).innerHTML = '<a onclick="changeToEdit(\'' + id + '\')" href="javascript:void(0);"><img src="/assets/img/icon/edit.png" alt="Edit" height="16" width="16"></a>&nbsp;&nbsp;&nbsp;&nbsp;' +
													'<a onclick="deletecmt(\'' + id + '\')" href="javascript:void(0);"><img src="/assets/img/icon/delete.png" alt="Delete" height="16" width="16"></a>';
}

function deletecmt(id){
	review_id = "rid_" + id;
	cmt_id = "cmt_" + id;
	dbtn_id = "dbtn_" + id;
	form_id = "form_" + id;
	text_id = "text_" + id;
	re_id = "re_" + id;
	
	jConfirm('Bạn có muốn xóa bình luận này ?', 'Xác nhận', function(r) {
		if(r == true) {
			document.getElementById('review_' + id).display = 'none';
			document.getElementById('review_' + id).style.visibility = 'hidden'; 
			document.getElementById('review_' + id).hidden = true;
		  // ok is true if the user clicked on "ok", false otherwise
			/*Meteor.call('deletecmt', csrf, pid, review_id, function (error, result) {
				if(result == true) {
						
					}  else {
						alert('Không thành công');
					}
				});
			*/
		}
	});
	
}