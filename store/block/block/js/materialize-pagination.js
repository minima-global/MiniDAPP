/*
 materialize Pagination v0.2.2
 http://mirjamsk.github.io/materialize-pagination/

 Sample usage:
    $('#pagination').materializePagination({ 
        align: 'left',
        lastPage:  10,
        firstPage:  1,
        urlParameter: 'page',
        useUrlParameter: true,
        onClickCallback: function(requestedPage){
            console.log('Requested page is '+ requestedPage)
        }
    });  
*/
;
(function($, window, document, undefined) {

    var MaterializePagination = function(elem, options) {
        this.$elem = $(elem);
        this.options = options;
        this.$container = null;
        this.$prevEllipsis = null;
        this.$nextEllipsis = null;
        this.currentPage = null;
        this.visiblePages = [];
        this.maxVisiblePages = 3;
    };

    MaterializePagination.prototype = {
        defaults: {
            align: 'center',
            lastPage: 1,
            firstPage: 1,
            urlParameter: 'page',
            useUrlParameter: true,
            onClickCallback: function() {}
        },

        init: function() {
            // Combine defaults with user-specified options
            this.config = $.extend({}, this.defaults, this.options);
            // Get page defined by the urlParameter
            var requestedPage = this.config.useUrlParameter ? this.parseUrl() : this.config.firstPage;
            // Create initial pagination and add it to the DOM
            if (this.createPaginationBase(requestedPage))
                this.bindClickEvent();
        },

        createPaginationBase: function(requestedPage) {
            if (isNaN(this.config.firstPage) || isNaN(this.config.lastPage)) {
                console.error('Both firstPage and lastPage attributes need to be integer values');
                return false;
            } else if (this.config.firstPage > this.config.lastPage) {
                console.error('Value of firstPage must be less than the value of lastPage');
                return false;
            }
            this.config.firstPage = parseInt(this.config.firstPage);
            this.config.lastPage = parseInt(this.config.lastPage);
            this.currentPage = this.config.firstPage - this.maxVisiblePages;

            this.$container = $('<ul>')
                .addClass('pagination')
                .addClass(this.config.align + '-align');

            this.$prevEllipsis = this.util.Ellipsis();
            this.$nextEllipsis = this.util.Ellipsis();

            var $firstPage = this.util.createPage(this.config.firstPage);
            var $prevChevron = this.util.createChevron('prev');
            var $nextChevron = this.util.createChevron('next');

            this.$container
                .append($prevChevron)
                .append($firstPage)
                .append(this.$prevEllipsis.$elem)
                .append(this.$nextEllipsis.$elem)
                .append($nextChevron);

            if (this.config.lastPage > this.config.firstPage) {
                var $lastPage = this.util.createPage(this.config.lastPage);
                $lastPage.insertBefore($nextChevron);
            }

            this.requestPage(requestedPage, true);
            this.renderActivePage();
            this.$elem.append(this.$container);
            return true;
        },

        requestPage: function(requestedPage, initing) {
            switch (requestedPage) {
                case this.currentPage:
                    return;
                case this.currentPage - 1:
                    this.requestPrevPage();
                    break;
                case this.currentPage + 1:
                    this.requestNextPage();
                    break;
                default:
                    this.requestPageByNumber(requestedPage);
            }
            if (!initing)
                this.config.onClickCallback(this.currentPage);
            this.renderActivePage();

            if (this.config.useUrlParameter)
                this.updateUrlParam(this.config.urlParameter, this.currentPage);
        },

        requestPrevPage: function() {
            this.currentPage -= 1;
            this.visiblePages.pop().remove();
            this.visiblePages.unshift(this.insertPrevPaginationComponent(this.currentPage - 1));
        },

        requestNextPage: function() {
            this.currentPage += 1;
            this.visiblePages.shift().remove();
            this.visiblePages.push(this.insertNextPaginationComponent(this.currentPage + 1));
        },

        requestPageByNumber: function(requestedPage) {
            this.purgeVisiblePages();
            this.currentPage = requestedPage;
            this.visiblePages.push(this.insertNextPaginationComponent(this.currentPage - 1));
            this.visiblePages.push(this.insertNextPaginationComponent(this.currentPage));
            this.visiblePages.push(this.insertNextPaginationComponent(this.currentPage + 1));
        },

        renderActivePage: function() {
            this.renderEllipsis();
            this.$container.find('li.active').removeClass('active');
            var currentPageComponent = $(this.$container.find('[data-page="' + this.currentPage + '"]')[0]);
            currentPageComponent.addClass('active');
        },

        renderEllipsis: function() {
            if (this.$prevEllipsis.isHidden &&
                this.currentPage >= this.config.firstPage + this.maxVisiblePages)
                this.$prevEllipsis.show();

            else if (!this.$prevEllipsis.isHidden &&
                this.currentPage <= this.config.firstPage + this.maxVisiblePages - 1)
                this.$prevEllipsis.hide();

            if (this.$nextEllipsis.isHidden &&
                this.currentPage <= this.config.lastPage - this.maxVisiblePages)
                this.$nextEllipsis.show();

            else if (!this.$nextEllipsis.isHidden &&
                this.currentPage >= this.config.lastPage - this.maxVisiblePages + 1)
                this.$nextEllipsis.hide();
        },

        bindClickEvent: function() {
            var self = this;
            this.$container.on('click', 'li', function() {
                var requestedPage = self.sanitizePageRequest($(this).data('page'));
                self.requestPage(requestedPage);
            });
        },

        insertPrevPaginationComponent: function(pageNumber) {
            if (pageNumber > this.config.firstPage && pageNumber < this.config.lastPage) {
                var $paginationComponent = this.util.createPage(pageNumber);
                return $paginationComponent.insertAfter(this.$prevEllipsis.$elem);
            }
            return $('');
        },

        insertNextPaginationComponent: function(pageNumber) {
            if (pageNumber > this.config.firstPage && pageNumber < this.config.lastPage) {
                var $paginationComponent = this.util.createPage(pageNumber);
                return $paginationComponent.insertBefore(this.$nextEllipsis.$elem);
            }
            return $('');
        },

        sanitizePageRequest: function(pageData) {
            var requestedPage = this.config.firstPage;

            if (pageData === 'prev') {
                requestedPage =
                    this.currentPage === this.config.firstPage ?
                    this.currentPage : this.currentPage - 1;
            } else if (pageData === 'next') {
                requestedPage =
                    this.currentPage === this.config.lastPage ?
                    this.currentPage : this.currentPage + 1;
            } else if (!isNaN(pageData) &&
                pageData >= this.config.firstPage &&
                pageData <= this.config.lastPage) {
                requestedPage = parseInt(pageData);
            }
            return requestedPage;
        },

        purgeVisiblePages: function() {
            var size = this.visiblePages.length;
            for (var page = 0; page < size; page += 1)
                this.visiblePages.pop().remove();
        },

        parseUrl: function() {
            var requestedPage = this.getUrlParamByName(this.config.urlParameter) || this.config.firstPage;
            return this.sanitizePageRequest(requestedPage);
        },

        getUrlParamByName: function(name) {
            name = name.replace(/[\[\]]/g, "\\$&");
            var url = window.location.href;
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
            var results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        },

        updateUrlParam: function(key, value) {
            var baseUrl = [location.protocol, '//', location.host, location.pathname].join(''),
                urlQueryString = document.location.search,
                newParam = key + '=' + value,
                params = '?' + newParam;

            if (urlQueryString) { // If the "search" string exists, then build params from it
                keyRegex = new RegExp('([\?&])' + key + '[^&]*');

                if (urlQueryString.match(keyRegex) !== null) { // If param exists already, update it
                    params = urlQueryString.replace(keyRegex, "$1" + newParam);
                } else { // Otherwise, add it to end of query string
                    params = urlQueryString + '&' + newParam;
                }
            }
            window.history.pushState('', '', params);
        },

        util: {
            createPage: function(pageData) {
                return $('<li>')
                    .html('<a>' + pageData + '</a>')
                    .addClass('waves-effect')
                    .attr('data-page', pageData);
            },
            createChevron: function(type) {
                var direction = type === 'next' ? 'right' : 'left';

                var $icon = $('<i>')
                    .addClass('waves-effect')
                    .addClass('material-icons')
                    .text('chevron_' + direction);

                return this.createPage(type).text('')
                    .attr('data-page', type)
                    .append($icon);
            },
            Ellipsis: function() {
                var $ellipsis = $('<li>');
                $ellipsis.text('...');
                $ellipsis.addClass('hide disabled');
                return {
                    $elem: $ellipsis,
                    isHidden: true,
                    show: function() {
                        this.isHidden = false;
                        this.$elem.removeClass('hide');
                    },
                    hide: function() {
                        this.isHidden = true;
                        this.$elem.addClass('hide');
                    }
                };
            }
        }
    };

    MaterializePagination.defaults = MaterializePagination.prototype.defaults;
    $.fn.materializePagination = function(options) {
        return this.each(function() {
            new MaterializePagination(this, options).init();
        });
    };
})(jQuery, window, document);
