<?PHP

	header("Content-type: text/html; charset=utf-8");
	$con = mysql_connect('localhost','root','123');
	mysql_select_db('ajaxmusic');
	mysql_query('set names utf8');

?>