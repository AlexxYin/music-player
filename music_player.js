/*
* @Author: Yin
* @Date:   2018-12-22 15:58:01
* @Last Modified by:   Yin
* @Last Modified time: 2019-01-14 10:40:29
*/


$(function(){
	//console.log($(window).width());  //980 改成 320
	var viewWidth = $(window).width();
	var viewHeight = $(window).height();
	var desWidth = 640;
	var touchstart = 'touchstart';
	var touchmove = 'touchmove';
	var touchend = 'touchend';
	var id = 0;
	var index = 0;
	var oAudio = $('#audio1').get(0);//jq转js原生方法
	
	var $main = $('#main');
	var $listContent = $('#listContent');
	var $listContentUl = $('#listContentUl');
	var $listTitle = $('#listTitle');
	var $listAudio = $('#listAudio');
	var $listAudioImg = $('#listAudioImg');
	var $listAudioText = $('#listAudioText');
	var $listAudioBtn = $('#listAudioBtn');
	
	var $musicDetails = $('#musicDetails');
	var $detailsTitle = $('#detailsTitle');
	var $detailsName = $('#detailsName');
	var $detailsAudioProUp = $('#detailsAudioProUp');
	var $detailsAudioProBar = $('#detailsAudioProBar');
	var $detailsNowTime = $('#detailsNowTime');
	var $detailsAllTime = $('#detailsAllTime');
	var $detailsPlay = $('#detailsPlay');
	var $detailsPrev = $('#detailsPrev');
	var $detailsNext = $('#detailsNext');
	
	function init(){   //整个项目的初始化
		device();
		musicList.init();
		musicDetails.init();
		musicAudio.init();
	}
	
	function device(){   //兼容PC和移动端
		//console.log( navigator.userAgent );
		var isMobile = /Mobile/i.test(navigator.userAgent);
		if(viewWidth > desWidth){
			$main.css('width','640px');
		}
		if(!isMobile){
			touchstart = 'mousedown';
			touchmove = 'mousemove';
			touchend = 'mouseup';
		}
	}
	
	var musicList = (function(){     //音乐列表页操作
		
		var bbsUrl = 'https://github.com/AlexxYin';
		var listUrl = 'musicList.php';
		var downY = 0;
		var prevY = 0;
		var downT = 0;
		var parentH = $listContent.height();
		var childH = $listContentUl.height();
		var onoff1 = true;
		var onoff2 = true;
		var onoff3 = true;
		var timer = null;
		var speed = 0;
		
		function init(){  //初始
			data();
			bind();
			moveScroll();
		}
		
		function data(){  //数据
			$.ajax({
				url : listUrl,
				type : 'GET',
				dataType : 'json',
				success : function(data){
					$.each(data,function(i,obj){
						var $li = '<li musicId="'+(obj.id)+'"><h3 class="title">'+(obj.musicName)+'</h3><p class="name">'+(obj.name)+'</p></li>';
						$listContentUl.append($li);
					});
					childH = $listContentUl.height();
				}
			});
		}
		
		function bind(){   //事件
			$listTitle.on(touchstart,function(){
				window.location = bbsUrl;
			});
			$listContentUl.delegate('li',touchend,function(){
				if(onoff3){
					$(this).attr('class','active').siblings().attr('class','');
					id = $(this).attr('musicId');
					musicAudio.loadMusic(id);
					index = $(this).index();
				}
			});
			
			
			$listAudio.on(touchstart,function(){
				if(id){
					musicDetails.sildeUp();
				}
			});
		}
		
		function moveScroll(){   //滑动列表
			$(document).on(touchmove,function(ev){
				ev.preventDefault();
			});
			$listContentUl.on(touchstart,function(ev){
				//ev.pageX
				//touch.pageX
				//ev.originalEvent -> JQ的event转成JS的event
				if(parentH > childH){return false;}
				var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
				var This = this;
				downY = touch.pageY;
				prevY = touch.pageY;
				downT = $(this).position().top;
				onoff1 = true;
				onoff2 = true;
				onoff3 = true;
				clearInterval(timer);
				$(document).on(touchmove+'.move',function(ev){
					onoff3 = false;
					var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
					var iTop = $(This).position().top;
					
					speed = touch.pageY - prevY;
					prevY = touch.pageY;
					
					if(iTop >= 0){   //头
						if(onoff1){
							onoff1 = false;
							downY = touch.pageY;
						}
						$(This).css('transform','translate3d(0,'+(touch.pageY - downY)/3+'px,0)');
					}
					else if(iTop <= parentH - childH){  //尾
						if(onoff2){
							onoff2 = false;
							downY = touch.pageY;
						}
						$(This).css('transform','translate3d(0,'+((touch.pageY - downY)/3 + (parentH - childH))+'px,0)');
					}
					else{
						$(This).css('transform','translate3d(0,'+(touch.pageY - downY + downT)+'px,0)');
					}
					
				});
				$(document).on(touchend+'.move',function(){
					$(this).off('.move');
					
					//console.log(speed);
					if(!onoff3){
						clearInterval(timer);
						timer = setInterval(function(){
							var iTop = $(This).position().top;
							if(Math.abs(speed) <= 1 || iTop > 50 || iTop < parentH - childH - 50){
								clearInterval(timer);
								if(iTop >= 0){
									$(This).css('transition','.2s');
									$(This).css('transform','translate3d(0,0,0)');
								}
								else if(iTop <= parentH - childH){
									$(This).css('transition','.2s');
									$(This).css('transform','translate3d(0,'+(parentH - childH)+'px,0)');
								}
							}
							else{
								speed *= 0.9;
								$(This).css('transform','translate3d(0,'+(iTop + speed)+'px,0)');
							}
							
						},13);
					}
				});
				return false;
			});
			$listContentUl.on('transitonend webkitTransitionEnd',function(){
				$(this).css('transition','');
			});
		}
		
		function show(sName,sMusicName,sImg){   //显示
			$listAudioImg.attr('src','img/'+sImg);
			$listAudioText.find('h3').html(sMusicName);
			$listAudioText.find('p').html(sName);
			$listAudioBtn.show();
		}
		
		return {
			init : init,
			show : show
		};
		
	})();
	
	var musicDetails = (function(){    //音乐详情页操作
		function init(){    //初始
			$musicDetails.css('transform','translate3d(0,'+(viewHeight)+'px,0)');
			bind();
		}
		function sildeUp(){    //向上展开
			$musicDetails.css('transition','.5s');
			$musicDetails.css('transform','translate3d(0,0,0)');
		}
		function sildeDown(){   //向下收缩
			$musicDetails.css('transform','translate3d(0,'+(viewHeight)+'px,0)');
		}
		function bind(){    //事件
			$detailsTitle.on(touchstart,function(){
				sildeDown();
			});
		}
		function show(sName,sMusicName,sLyric){   //显示
			$detailsName.html(sMusicName + ' <span>'+ sName +'</span>');
		}
		return {
			init : init,
			sildeUp : sildeUp,
			show : show
		};
	})();
	
	var musicAudio = (function(){    //音乐播放器操作
		var onoff = true;
		var timer = null;
		var scale = 0;
		var disX = 0;
		var parentW = $detailsAudioProBar.parent().width();
		function init(){   //初始
			bind();
		}
		function loadMusic(id){   //载入音乐
			$.ajax({
				url : 'musicAudio.php',
				type : 'GET',
				dataType : 'json',
				data : { id : id },
				success : function(data){
					show(data);
					/*console.log(data);*/
				}
			});
		}
		function show(obj){    //显示
			var sName = obj.name;
			var sMusicName = obj.musicName;
			var sLyric = obj.lyric;
			var sImg = obj.img;
			var sAudio = obj.audio;
			musicList.show(sName,sMusicName,sImg);
			musicDetails.show(sName,sMusicName,sLyric);
			oAudio.src = 'img/'+sAudio;
			$(oAudio).one('canplaythrough',function(){
				play();
				$detailsAllTime.html( formatTime(oAudio.duration) );
			});
			$(oAudio).one('ended',function(){
				next();
			});
		}
		function play(){   //播放
			onoff = false;
			$listAudioImg.addClass('move');
			$listAudioBtn.css('backgroundImage','url(img/list_audioPause.png)');
			$detailsPlay.css('backgroundImage','url(img/details_pause.png)');
			oAudio.play();
			playing();
			clearInterval(timer);
			timer = setInterval(playing,1000);
		}
		function pause(){  //暂停
			onoff = true;
			$listAudioImg.removeClass('move');
			$listAudioBtn.css('backgroundImage','url(img/list_audioPlay.png)');
			$detailsPlay.css('backgroundImage','url(img/details_play.png)');
			oAudio.pause();
			clearInterval(timer);
		}
		function bind(){   //事件
			$listAudioBtn.add($detailsPlay).on(touchstart,function(){
				if(onoff){
					play();
				}
				else{
					pause();
				}
				return false;
			});
			$detailsAudioProBar.on(touchstart,function(ev){
				var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
				var This = this;
				disX = touch.pageX - $(this).position().left;
				clearInterval(timer);
				$(document).on(touchmove+'.move',function(ev){
					var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
					var L = touch.pageX - disX;
					if(L<=0){
						L = 0;
					}
					else if(L >= parentW){
						L = parentW;
					}
					$(This).css('left', L );
					scale = L/parentW;
				});
				$(document).on(touchend+'.move',function(){
					$(this).off('.move');
					oAudio.currentTime = scale * oAudio.duration;
					playing();
					clearInterval(timer);
					timer = setInterval(playing,1000);
				});
				return false;
			});
			$detailsPrev.on(touchstart,function(){
				prev();
			});
			$detailsNext.on(touchstart,function(){
				next();
			});
		}
		function formatTime(num){   //格式日期
			num = parseInt(num);
			var iM = Math.floor(num%3600/60);
			var iS = Math.floor(num%60);
			return toZero(iM) + ':' + toZero(iS);
		}
		function toZero(num){    //补零操作
			if(num < 10){
				return '0' + num;
			}
			else{
				return '' + num;
			}
		}
		function playing(){    //播放进行中
			$detailsNowTime.html( formatTime(oAudio.currentTime) );
			scale = oAudio.currentTime / oAudio.duration;
			$detailsAudioProUp.css('width',scale * 100 + '%');
			$detailsAudioProBar.css('left',scale * 100 + '%');
		}
		function next(){    //下一首歌
			var $li = $listContentUl.find('li');
			index = index === $li.length - 1 ? 0 : index + 1;
			id = $li.eq(index).attr('musicId');
			$li.eq(index).attr('class','active').siblings().attr('class','');
			loadMusic(id);
		}
		function prev(){    //上一首歌
			var $li = $listContentUl.find('li');
			index = index === 0 ? $li.length - 1 : index - 1;
			id = $li.eq(index).attr('musicId');
			$li.eq(index).attr('class','active').siblings().attr('class','');
			loadMusic(id);
		}
		return {
			init : init,
			loadMusic : loadMusic
		};
	})();
	
	init();
	
});