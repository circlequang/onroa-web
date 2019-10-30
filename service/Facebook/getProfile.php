<?php
include "autoload.php";

$fb = new Facebook\Facebook([
  'app_id' => '1286728268051325',
  'app_secret' => '61599f99f67e2cde6d15298850780a58',
  'default_graph_version' => 'v2.2',
  ]);

try {
  // Returns a `Facebook\FacebookResponse` object
  $response = $fb->get('/me?fields=id,name,email,picture.type(large),gender', "EAASSRcVW830BAL6Drg2il5MI7sdsGhENHSZBdYo8viMUh2mMTtdEMKE2HHWdn4ZCgLH4Bm8oZC0ZBFgSx3MZA3PH94P7VZA2t7okcD0MZAiR86s1hfoAq1MUV4MYPy8vQQlpZBAtFlKalx4WARWQ6lrE7DZAh3LwH3CahZCwvD3HcPBv0cdBQ3bt5v3SZBnBZAMX9EQZD");
} catch(Facebook\Exceptions\FacebookResponseException $e) {
  echo 'Graph returned an error: ' . $e->getMessage();
  exit;
} catch(Facebook\Exceptions\FacebookSDKException $e) {
  echo 'Facebook SDK returned an error: ' . $e->getMessage();
  exit;
}

$user = $response->getGraphUser();
if($user == null) echo -3; //Không lấy được data từ FB
//echo $user['email'] . "\n";
var_dump($user);
//echo  "\n";
//echo $user['picture']['url'];

?>