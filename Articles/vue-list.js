(function ($) {
    $(document).ready(function () {
        initPage(document);
    });
    $(document).on("opencontent.change", function (event, element) {
        initPage(element);
    });
	
	 function debounce(func, timeout = 300) {
        let timer;
        return function(vm) {
            clearTimeout(timer);
            timer = setTimeout(() => {
                func(this, vm);
            }, timeout);
        };
    }
	
    var template = '';
    function initPage(element) {
        $(".vuelist", element).each(function () {
            var moduleid = $(this).attr('data-moduleid');
            var moduleScope = $(this),
                self = moduleScope,
					sf = $.ServicesFramework(moduleid);

			var rawdata= opencontent[moduleid];
		  
			 var app = new Vue({
              el: "#vuelist",
              //template: "#vue-list-template",
              data: {
                message: 'Hello Vue!',
                Items : [],
                search: "",
				categories:[],
				tags:[],
				sort:'Title',
				pageIndex:0,
				pageSize:10,
				total: 0,
				pages:[],
                opencontent: rawdata
              },
              mounted: function(){
                this.searchItems();
              },
              methods: {
				changeSearch: function()  {
					 this.doSearch(this);
				},
				doSearch: debounce(function(vm) {
					vm.searchItems();
				}),
				changePageSize: function (size){
					this.pageSize= size;
					this.searchItems();
				},
				changePageIndex: function (index){
					if (index >=0 && index < this.pages.length){
						this.pageIndex= index;
						this.searchItems();
					}
				},
                searchItems: function(){
                  	var self = this;
                    var filter = null;                    
                    if (self.search) {
                        filter = {
                            rules: [{field: "Title", operator:"START_WITH", value: self.search}]
                        };
                    }
					if (this.categories.length){
						filter=filter||{rules:[]};
						filter.rules.push({field: "Category", operator:"IN", multiValue: self.categories});
					}
					if (this.tags.length){
						filter=filter||{rules:[]};
						filter.rules.push({field: "Tags", operator:"IN", multiValue: self.tags});
					}
                  	var sort = [{field: self.sort}];
                    this.apiGet(sf, self.pageIndex, self.pageSize, filter, sort, function (data) {
                   		self.Items = data.items;
						self.total= data.meta.total;
						self.pages=[];
						for(var i=0;i*self.pageSize  < self.total; i++){
							self.pages.push(i);
						}
                    });
                },
				 apiGet: function (sf, pageIndex, pageSize, filter, sort, callback) {
					$.ajax({
						type: "GET",
						url: sf.getServiceRoot('OpenContent') + "Rest/v1/items",
						contentType: "application/json; charset=utf-8",
						dataType: "json",
						data: {pageIndex: pageIndex, pageSize: pageSize, filter: JSON.stringify(filter), sort: JSON.stringify(sort)},
						beforeSend: sf.setModuleHeaders
					}).done(function (data) {
						if (callback) callback(data);
					}).fail(function (xhr, result, status) {
						alert("Uh-oh, something broke: " + status);
					});
				}
						   
              },
			  components: {
				vueListItem: {
				 
				  template: "#vue-list-template",
				  props:['Items'] ,
					
				  
				  data: function (){
					return {
					
					};
				  }
				}
			  }
            });
		  
          
        });

        $(".flexslider.flex-carousel", element).each(function () {
            $(this).flexslider({
                'animationLoop': $(this).attr("data-animationloop") ? $(this).data("animationloop") : false,
                'slideshow': $(this).attr("data-slideshow") ? $(this).data("slideshow") : false,
                'animation': "slide",
                'touch': $(this).attr("data-touch") ? $(this).data("touch") : false,
                'controlNav': $(this).attr("data-controlnav") ? $(this).data("controlnav") : false,
                'directionNav': $(this).attr("data-directionnav") ? $(this).data("directionnav") : false,
                'itemWidth': $(this).attr("data-itemwidth") ? $(this).data("itemwidth") : 210,
                'itemMargin': $(this).attr("data-itemmargin") ? $(this).data("itemmargin") : 5,
                'minItems': $(this).attr("data-minitems") ? $(this).data("minitems") : 0,
                'maxItems': $(this).attr("data-maxitems") ? $(this).data("maxitems") : 0,
                'move': $(this).attr("data-move") ? $(this).data("move") : 0,
                'asNavFor': $(this).attr("data-asnavfor") ? $(this).data("asnavfor") : ""
            });
        });
        $(".flexslider.flex-slider", element).each(function () {
            $(this).flexslider({
                'animationLoop': $(this).attr("data-animationloop") ? $(this).data("animationloop") : false,
                'slideshow': $(this).attr("data-slideshow") ? $(this).data("slideshow") : false,

                'animation': $(this).attr("data-animation") ? $(this).data("animation") : "slide",
                'touch': $(this).attr("data-touch") ? $(this).data("touch") : false,
                'controlNav': $(this).attr("data-controlnav") ? $(this).data("controlnav") : false,
                'directionNav': $(this).attr("data-directionnav") ? $(this).data("directionnav") : false,
                'sync': $(this).attr("data-sync") ? $(this).data("sync") : ""
            });
        });
    }
    if (typeof Handlebars != 'undefined') {
        Handlebars.registerHelper('formatDateTime', function (context, format) {
            if (window.moment && context && moment(context).isValid()) {
                var f = format || "DD/MM/YYYY";
                return moment(context).format(f);
            } else {
                return context;   //  moment plugin is not available, context does not have a truthy value, or context is not a valid date
            }
        });
    }
}(jQuery));