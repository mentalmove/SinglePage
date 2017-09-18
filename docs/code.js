(function (win_dow, docu_ment, class_name, boring_grey) {
    
    var pages = [];
    var window_height = 0;
    var sections = [];
    
    function highlight (index) {
        sections[index][class_name] = "section";
        if ( index )
            sections[index - 1][class_name] = boring_grey;
        if ( (index + 1) < sections.length )
            sections[index + 1][class_name] = boring_grey;
    }

    var scroll_y = 0;
    var stored_index = -1;
    var THRESHOLD = 32;
    var SCROLL_DOWN_TOLERANCE = 128;
    var SCROLL_UP_TOLERANCE = 256;
    function compare_sections (down) {
        if ( down ) {
            for ( var i = (sections.length - 1); i >= 0; i-- ) {
                if ( (sections[i].yy - scroll_y) < SCROLL_DOWN_TOLERANCE ) {
                    if ( i == stored_index )
                        return;
                    if ( i == (sections.length - 1) )
                        load_pages(sections.length);
                    highlight(i);
                    if ( stored_index >= 0 )
                        win_dow.history.pushState("", "Title", pages[i]);
                    stored_index = i;
                    window_height = get_window_height();
                    return;
                }
            }
        }
        else {
            if ( stored_index <= 0 || !window_height )
                return;
            var actual = sections[stored_index];
            if ( (actual.yy - scroll_y) > (window_height - SCROLL_UP_TOLERANCE) ) {
                stored_index--;
                highlight(stored_index);
                win_dow.history.pushState("", "Title", pages[stored_index]);
            }
        }
    }
    function on_scroll () {
        if ( Math.abs(pageYOffset - scroll_y) < THRESHOLD )
            return;
        compare_sections( (pageYOffset - scroll_y) > 0 );
        scroll_y = pageYOffset;
    }

    function check_section_data () {
        var y;
        for ( var i = sections.length - 1; i >= 0; i-- ) {
            y = get_position(sections[i]);
            if ( y == sections[i].yy )
                return;	
            sections[i].yy = y;
        }
    }

    function skip_file (error_message) {
        if ( sections.length <= pages.length ) {
            console.log( pages[sections.length] + ": " + error_message + ", will be skipped" );
            pages.splice(sections.length, 1);
            load_pages(sections.length);
        }
    }

    function content_loaded (receiveReq, element, callback_function) {
        if ( receiveReq.readyState == 4 && (receiveReq.response || receiveReq.responseText) ) {
            var response = receiveReq.response || receiveReq.responseText;
            if ( response.indexOf("<meta") == -1 || (receiveReq.status && receiveReq.status >= 400) ) {
                skip_file(receiveReq.statusText);
                return;
            }
            element.innerHTML = response;
            callback_function();
        }
    }
    function load_content (url, element, callback_function) {
        var receiveReq = new XMLHttpRequest();
        if ( receiveReq.readyState == 4 || receiveReq.readyState == 0 ) {
            receiveReq.open("GET", url, true);
            receiveReq.onreadystatechange = function () {
                content_loaded(receiveReq, element, callback_function);
            };
            receiveReq.send(null);
        }
    }

    function create_section () {
        var section = docu_ment.createElement("div");
        section.className = boring_grey;
        var inner = docu_ment.createElement("div");
        inner[class_name] = "inner";
        section.appendChild(inner);
        return inner;
    }

    function section_added (section) {
        sections.push(section);
        docu_ment.body.appendChild(section);
        section.yy = get_position(section);
        compare_sections(true);
    }

    function get_window_height () {
        if ( win_dow.innerHeight )
            return win_dow.innerHeight;
        if ( docu_ment.body && docu_ment.body.clientHeight )
            return docu_ment.body.clientHeight;
        if ( docu_ment.documentElement && docu_ment.documentElement.clientHeight )
            return docu_ment.documentElement.clientHeight;
        var tmp = docu_ment.createElement("div");
        tmp.style.position = "fixed";
        tmp.style.right = "0px";
        tmp.style.bottom = "0px";
        docu_ment.body.appendChild(tmp);
        var y = get_position(tmp);
        tmp.parentNode.removeChild(tmp);
        return y;
    }
    function get_position (element) {
        var parent_element = element.offsetParent || docu_ment.body;
        var top = element.offsetTop;
        while ( parent_element ) {
            top += parent_element.offsetTop;
            parent_element = parent_element.offsetParent;
        }
        return top;
    }

    function load_pages (index) {
        if ( index >= pages.length )
            return;
        var section_content = create_section();
        load_content(pages[index], section_content, function(){section_added(section_content.parentNode)});
    }
    
    function get_basic_content () {
        var section_content = document.getElementsByClassName("inner")[0];
        section_added(section_content.parentNode);
    }

    function init () {
        pages = arguments.callee.arguments;
        for ( var i = 0; i < pages.length; i++ )
            if ( !pages[i].match(/\.html$/) )
                pages[i] = pages[i] + ".html";
        get_basic_content();
        //load_pages(0);
        docu_ment.body.onscroll = on_scroll;
        setInterval(check_section_data, 3456);
    }
    win_dow.init = init;
})( window,
    document,
    "className",
    "boring_grey"
  );
  
function demonstrate () {
    init("index", "step1");
}
