//Gọi service load category
$.ajax({ 
	async: false,
	cache: false,                                
	url: 'service.php?sv=page&f=loadCategory',
	type: "GET",
	success: function(jsonText, textStatus, jqXHR) {
		result  = JSON.parse(jsonText);
		categoryHtml = document.getElementById('category');
		for (var i = 0; i< result.length; i++){
			var opt = document.createElement('option');
			opt.value = result[i].category_id;
			opt.innerHTML = result[i].category_name.vi;
			categoryHtml.appendChild(opt);
		}
	},
	error: function() {
		jAlert("Không truy xuất được hệ thống", "Thông báo");
		return null;
	}
});

//Set default là 1 và 5
str = '1,5';
arr_category = str.split(',');

categoryHtml = document.getElementById( 'category' );
l = categoryHtml.options.length;
for ( var i = 0; i < l; i++ )
{
	o = categoryHtml.options[i];
	if ( arr_category.indexOf( o.value ) != -1 ) {
		o.selected = true;
	}
}

$('select').selectpicker('render');