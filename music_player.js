/*
* @Author: Yin
* @Date:   2018-12-22 15:58:01
* @Last Modified by:   Yin
* @Last Modified time: 2018-12-25 11:48:14
*/


$(function(){
	//console.log($(window).width());  //980 改成 320
	var viewWidth = $(window).width();
	var viewHeight = $(window).height();
	var desWidth = 414;
	var touchstart = 'touchstart';
	var touchmove = 'touchmove';
	var touchend = 'touchend';
	
	var $main = $('#main');
	var $listContent = $('#listContent');
	var $listContentUl = $('#listContentUl');
	var $listTitle = $('#listTitle');
	
	function init(){   //整个项目的初始化
		device();
		musicList.init();
	}
	
	function device(){   //兼容PC和移动端
		//console.log( navigator.userAgent );
		var isMobile = /Mobile/i.test(navigator.userAgent);
		if(viewWidth > desWidth){
			$main.css('width','414px');
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
						var $li = '<li><h3 class="title">'+(obj.musicName)+'</h3><p class="name">'+(obj.name)+'</p></li>';
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
				clearInterval(timer);
				$(document).on(touchmove+'.move',function(ev){
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
					
				});
				return false;
			});
			$listContentUl.on('transitonend webkitTransitionEnd',function(){
				$(this).css('transition','');
			});
		}
		
		return {
			init : init
		};
		
	})();
	
	init();
	
});