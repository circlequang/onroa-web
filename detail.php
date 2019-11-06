<?php
require_once('service/fnc/config.php');	
//Trường hợp user này không phải robot => redirect đến trang detail.html

$user_agent = strtolower($_SERVER['HTTP_USER_AGENT']);
$bot = '/facebookexternalhit|Facebot|Twitterbot|Pinterest|Google.*snippet|LinkedInBot|bingbot|Yahoo|MSNBot|YahooSeeker|baiduspider|rogerbot|embedly|quora\ link\ preview|showyoubot|outbrain|Slackbot|Slack-ImgProxy|Slackbot-LinkExpanding|Site\ Analyzer|SiteAnalyzerBot|Viber|WhatsApp|Telegram|Googlebot|MJ12bot|yandexbot/i';
$bot = strtolower($bot);
if(!preg_match($bot, $user_agent)){
	$actual_link = "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
	$actual_link = str_replace('.php', '.html', $actual_link);
	header("Location: " . $actual_link);
	return;
} 


$points = new MongoCollection($db, 'points');
$url = $_GET['url'];
$query = array('url' => $url);
$result = $points->findOne($query);
if(sizeOf($result) <= 0) return;
?>
<!DOCTYPE html>
<html lang="en-US">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
	
	<meta name="description" content="<?=$result['title']?>, <?=$result['description']['vi']?>">
	<meta name="keywords" content="<?=$result['title']?>, <?=$result['description']['vi']?>, <?=$result['q']?>">
	<meta name="title" content="Onroa - <?=$result['title']?>" />

	<meta property="fb:app_id" content="1286728268051325"/>
	<meta property="og:title" content="Onroa - <?=$result['title']?>"/>
	<meta property="og:site_name" content="Onroa - <?=$result['title']?>"/>
	<meta property="og:description" content="<?=$result['description']['vi']?>"/>
	<meta property="og:type" content="blog" />
	<meta property="og:image" content="<?=$result['gallery'][0]?>" />
	<meta property="og:image:width" content="560" />
	<meta property="og:image:height" content="292" />
	<meta property="og:url" content="https://onroa.com/detail.html?<?=$result['url']?>" />

	
    <title>Onroa - <?=$result['title']?></title>

</head>

<body onunload="" class="page-subpage page-item-detail navigation-off-canvas" id="page-top">
	<?=$result['title']?><br>
	<?=$result['description']['vi']?> <br>
	<?=$result['q']?> <br>
	<H2>Liên hệ: </H2><br>
	Địa chỉ: <?=$result['address']?> <br>
	Thành phố: <?=$result['city']?> <br>
	Phone: <?=$result['home_phone']?> <br>
	Mobile: <?=$result['mobile_phone']?> <br>
	Website: <?=$result['website']?> <br>
	Giá: <?=$result['price']?> <br>
	<?=$result['price_from']?> - <?=$result['price_to']?>  <br><br>
	<H2>Mô tả: </H2>
	<?=$result['title']?><br>
	<?=$result['description']['vi']?> <br>
	<H2>Đánh giá: </H2>
	<?php
	
	foreach($result['review'] as $item) {
		echo '<b>' . $item['display_name'] . "</b>: " . $item['cmt'] . "<br>\n";
	}
	if(isset($result['gref'])) {
		foreach($result['gref']['review'] as $item ) {
			echo '<b>' . $item['display_name'] . "</b>: " . $item['cmt'] . "<br>\n";
		}
	}
	
	?>
	
</body>
</html>