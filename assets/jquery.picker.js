/**
 * @huahuadavids
 * @mobile picker
 */
(function ($) {
  $.fn.extend({
    "wgPicker": function (options) {
      var defaults = {
        setValue: null,
        type: 'week',//类型
        data: null,  //可显示5行的数据
        time: 200,   //滑动间隔
        lineClass: 'wg-date',
        align: 'center',
        content: [
          {'height': 30, 'top': 0, 'fontSize': 18, 'color': 'rgba(255,255,255,0.56)'},
          {'height': 45, 'top': 30, 'fontSize': 20, 'color': 'rgba(255,255,255,0.56)'},
          {'height': 60, 'top': 75, 'fontSize': 24, 'color': '#4bd6b3'},
          {'height': 45, 'top': 135, 'fontSize': 20, 'color': 'rgba(255,255,255,0.56)'},
          {'height': 30, 'top': 180, 'fontSize': 18, 'color': 'rgba(255,255,255,0.56)'}
        ],
        months: 30, //默认一个月30天
        yearGap: [10,10],//年的开始和截止，一位代表前到现在，两位代表前后
        setDay: [null,null]
      };

      /**
       * @初始化日期和时间
       * @type {Date}
       * @private
       */
      var _now = new Date();
      var _now_hour = _now.getHours();
      var _now_minute = _now.getMinutes();
      var _now_year = _now.getFullYear();
      var _now_month = _now.getMonth() + 1;
      var _now_day = _now. getDate();
      var _tmp_date = new Date();
      _tmp_date.setMonth(_now_month);
      _tmp_date.setDate(0);
      var _now_days = _tmp_date.getDate();// 默认当前月的天数

      window.wgPickerShouldUpdateValue = false;
      var _this = this;
      var InitIndex = 0;
      var ticking, picker_height = 0,picker_minute;
      var datas = $.extend({}, defaults, options);
      var lineClass = datas.lineClass || defaults.lineClass;
      var picker_contents = datas.content || defaults.content;
      var picker_yearGap = datas.yearGap || defaults.yearGap;
      var lineSelector = '.' + lineClass;
      var picker_padding = '<div class="' + lineClass + '"></div>' + '<div class="' + lineClass + '"></div>';
      var picker_cover  = '<div class="wg-picker-timezone-cover1 wg-timezone"></div>\
                            <div class="wg-picker-timezone-cover2 wg-timezone"></div>';
      var picker_line_normal = picker_contents[0];

      if(datas.setDay[0]){//如果不是获取默认的日期
        var setDate = new Date();
        var setYear = parseInt(datas.setDay[0]);
        var setMonth = parseInt(datas.setDay[1]);
        setDate.setFullYear(setYear)
        setDate.setMonth(setMonth);
        setDate.setDate(0);
        _now_days = setDate.getDate();
      }
      /**
       * @初始化数据
       * @type {{week: string[]}}
       */
      var picker_data = {
        'week': ['星期日','星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      };
      picker_data.year = [];
      var picker_year_roll = 0;
      var picker_year_this = new Date().getFullYear();
      var picker_year_first = picker_year_this - picker_yearGap[0];
      var picker_year_gap =  picker_yearGap[0] + (picker_yearGap.length -1 ? picker_yearGap[1]: 0 ) + 1;
      for(picker_year_roll; picker_year_roll<picker_year_gap;picker_year_roll++){
        picker_data.year.push(picker_year_first + picker_year_roll + '年')
      }
      picker_data.noon = ['上午','下午'];
      picker_data.hour = [];
      picker_data.minute = [];
      picker_data.second = [];
      picker_data.month = [];
      picker_data.day = [];
      picker_data.custom = [];
      for( picker_minute = 1; picker_minute < 61; picker_minute++){
        if(picker_minute < _now_days + 1){
          picker_data.day.push(picker_minute + '日')
        }
        if(picker_minute < 13){// hour数据
          picker_data.hour.push(picker_minute)
          picker_data.month.push(picker_minute + '月')
        }
        if(picker_minute < 5 ){
          picker_height +=picker_contents[picker_minute].height;
        }
        picker_data.minute.push(picker_minute)// minute 数据
        picker_data.second.push(picker_minute)// second 数据
      }

      if(datas.type === 'custom'){
        picker_data.custom = datas.data;
      }
      var main_data = picker_data[datas.type];
      /**
       * @自动获取当前时间
       */
      if(datas.type === 'week'){
        InitIndex = _now.getDay();
      }
      if(datas.type === 'noon'){
        InitIndex = _now_hour > 12;
      }
      if(datas.type == 'hour'){
        InitIndex =  (_now_hour > 12 ? _now_hour - 12 : _now_hour) - 1;
      }
      if(datas.type === 'minute'){
        InitIndex = _now_minute - 1 ;
      }
      if(datas.type === 'year'){
        for(var a  = 0; a< main_data.length;a++){
          if(main_data[a] === _now_year + '年' ){
            InitIndex = a;
          }
        }
      }
      if(datas.type === 'month'){
        InitIndex = _now_month - 1 ;
      }
      if(datas.type === 'day' && !datas.setDay[0]){
        InitIndex = _now_day;
      }
      /**
       * @初始化填充的DOM
       * @constructor
       */
      function InitDOM(){
        var htmls = '', roll;
        for (roll = 0; roll < main_data.length; roll++) {
          var tmpData;
          if( !isNaN(main_data[roll]) && main_data[roll] < 10){
            tmpData = '0' + main_data[roll];
          }else {
            tmpData =  main_data[roll];
          }
          htmls += '<div class="' + lineClass + '">' + tmpData + '</div>';
        }
        _this.css({"overflow":'hidden',"text-align": datas.align});
        _this.get(0).innerHTML += htmls;
        _this.prepend($(picker_padding)).append($(picker_padding)).append(picker_cover);
      }
      InitDOM();

      /**
       * @初始化user自定义的值
       */
      if(datas.setValue){
        var index = 0 , a = 0;
        for(a; a< main_data.length;a++){
          if(main_data[a] === datas.setValue){
            InitIndex = a;
          }
        }
      }
      _this.attr("data-index", InitIndex).find(lineSelector).each(function(index,dom){
        var tindex = 0 - InitIndex + index;
        $(dom).attr("data-index", tindex);
        if( tindex < 0 ){
          $(dom).css({
            'top' : tindex * 30 + 'px'
          })
        }
        else if (tindex > 4){
          $(dom).css({
            'top': picker_contents[4].top + (index - 4) * 30 + 'px'
          })
        }
        else {
          if(tindex === 2){
            _this.attr("data-value", $(dom).text());
          }
          $(dom).css({
            "height": picker_contents[tindex].height + 'px',
            "line-height": picker_contents[tindex].height + 'px',
            "top": picker_contents[tindex].top + 'px',
            'font-size': picker_contents[tindex].fontSize + 'px',
            'color': picker_contents[tindex].color
          });
        }
      });
      /**
       * @重新渲染视图
       */
      function renderDOM() {
        _this.find(lineSelector).each(function (index, val) {
          var tindex = $(val).attr("data-index") | 0;
          //超出的上边的部分
          if (tindex < 0) {
            $(val).css({
              'height': picker_line_normal.height + 'px',
              'line-height': picker_line_normal.height + 'px',
              'font-size': picker_line_normal.fontSize + 'px',
              'top': tindex * picker_line_normal.height + 'px'
            })
          } else {
            //多出下面的部分
            if (tindex > 4) {
              $(val).css({
                'height': picker_line_normal.height + 'px',
                'line-height': picker_line_normal.height + 'px',
                'font-size': picker_line_normal.fontSize + 'px',
                'top': (tindex - 4) * picker_line_normal.height + picker_height + 'px'
              })
            }
            else {
              if(tindex === 2){
                _this.attr("data-value", $(val).text());
              }
              $(val).css({
                'height': picker_contents[tindex].height + 'px',
                'line-height': picker_contents[tindex].height + 'px',
                'font-size': picker_contents[tindex].fontSize + 'px',
                'top': picker_contents[tindex].top + 'px',
                'color': picker_contents[tindex].color
              })
            }
          }
        })
      }

      /**
       * @更新DOM
       * @param tindex
       * @param direction
       * @constructor
       */
      function UpdateDOM(tindex, direction) {
        if (ticking) {
          return false;
        }
        if (direction) {
          if (tindex > 0) {
            _this.attr("data-index", tindex - 1).
            find(lineSelector).each(function (index, val) {
              $(val).attr("data-index", index - (tindex - 1));
            })
          }
          renderDOM();
        }
        if (!direction) {
          if (tindex < (main_data.length - 1) ){
            _this.attr("data-index", tindex + 1).find(lineSelector).each(function (index, val) {
              $(val).attr("data-index", index - (tindex + 1));
            });
            renderDOM();
          }
        }
        ticking = true;
        window.setTimeout(function () {
          ticking = false;
        }, datas.time || defaults.time)
        if(datas.type === 'year' || datas.type === 'month'){
          window.wgPickerShouldUpdateValue = true;
        }
      }

      /**
       * @移动端的滑动事件
       */
      var startX, startY, moveEndX, moveEndY, diffX, diffY;
      _this.on("touchstart", function (e) {
        e.preventDefault();
        startX = e.originalEvent.changedTouches[0].pageX,
          startY = e.originalEvent.changedTouches[0].pageY;
      });
      _this.on("touchmove", function (e) {
        e.preventDefault();
        moveEndX = e.originalEvent.changedTouches[0].pageX,
          moveEndY = e.originalEvent.changedTouches[0].pageY,
          diffX = moveEndX - startX,
          diffY = moveEndY - startY;
        UpdateDOM($(this).attr("data-index") | 0, diffY > 0);
      });
      /**
       * @一般滚轮事件
       * @param e
       */
      _this.get(0).onmousewheel = function (e) {
        e = e || window.event;
        e.stopPropagation();
        UpdateDOM($(this).attr("data-index") | 0, e.wheelDelta > 0);
      }
      /**
       * @firefox鼠标滚轮事件
       */
      _this.get(0).addEventListener("DOMMouseScroll", function (e) {
        e = e || window.event;
        UpdateDOM($(this).attr("data-index") | 0, e.detail > 0);
      });
    }
  });
})(jQuery);