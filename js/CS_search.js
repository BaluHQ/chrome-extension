/********
 * Init *
 ********/

/*
 * Global variables
 */

var gvScriptName_CSSearch = 'CS_search';

/*
 *
 */
(function initialise(){
    log(gvScriptName_CSSearch + '.initialise: Start','INITS');
})();

/********************
 * Search Functions *
 ********************/

/*
 * When all searching is finished, this is the function that's called
 * to pass the results back to the extension
 */
function processSearchResults(searchResults,foundSomething){

    if(searchResults !== null) {
        log(gvScriptName_CSSearch + '.processSearchResults: Start (searchResults.length == ' + searchResults.length + ')','PROCS');
    } else{
        log(gvScriptName_CSSearch + '.processSearchResults: Start (searchResults is null)','PROCS');
    }

    if (foundSomething) {
        sendMessage('BG_main','pleaseRetrieveRecommendations',{searchResults: searchResults});
    }
}

/*
 * This function searches the HTML of the page for each of the SearchProducts.
 *
 * @searchData is an array of SearchProducts, and also includes each SearchProduct's
 * SearchCategory as well as the corresponding webites that are "active" for that category.
 * Hence, @searchData can hold one SearchProduct multiple times, once for every website it
 * is valid for. (For example, Nescafe Coffee may be listed twice, once for Tesco.com and
 * once for Sainsbury.com.)
 *
 * We are going to loop through the SearchProducts and for every one where the website
 * matches the user's current URL, we're going to search the page. If we find it, we
 * add the searchProduct to a searchResults array.
 *
 * We can ignore the isWebsiteOnOrOff setting here, because this is checked during init
 * and Balu will not get this far for an inactive website.
 *
 */
function searchPage_master(searchData,tabURL,websiteURL){

    log(gvScriptName_CSSearch + '.searchPage_master: Start','PROCS');

    // Call getElements, which switches on the websiteURL and pulls the
    // correct DOM elements from the page based on the website we're looking at.
    // Then call, in sequence, the sexSearch, then the productSearch, then the callback
    // to the contentScript (which is receiveSearchResults)
    getElements(tabURL,websiteURL,sexSearch,productSearch,searchData,1);

}


/*
 *
 */
function getElements(tabURL,websiteURL,sexSearchCallback,productSearchCallback,searchData,attemptCount) {

    log(gvScriptName_CSSearch + '.getElements: Start >>> attemptCount == ' + attemptCount,'PROCS');

    /*************
     * Variables *
     *************/

    // Flow control
    var runSexSearch = true;
    var sexOverride;
    var i;
    var didWeFindEverything = false;

    // pageElements to be searched
    var productNames = [];
    var breadcrumbs;
    var URLText = tabURL.substring(tabURL.indexOf('/')).toLowerCase(); // we want the text after the first forward slash, for searching.
    var menFilter = 'NO';
    var womenFilter = 'NO';

    /*****************************************************
     * The Switch statement: one for each active website *
     *****************************************************/

     // In nearly all cases there are two page formats, multi-items or single item.
     // Check multi-items first and if no elements found, check single item
     // Sometimes there are different grid layouts, e.g. list / thumbnail, although
     // if you're lucky the page DOM is the same

    switch(websiteURL){

        /*
         * AMAZON
         */

        case 'www.amazon.co.uk':

            runSexSearch = true;

            // Breadcrumbs

            var amazonInfoBar = document.getElementById('s-result-info-bar-content');
            if(amazonInfoBar !== null) {
                breadcrumbs = amazonInfoBar.textContent.toLowerCase();
            }

            // Search results page //

            var amazon_resultsCol = document.getElementById('resultsCol');

            // The resultsCol div is the grid that (usually) contains all search results.
            // What's inside it depends on the view, but it seems that all the
            // product names are links with class = s-access-detail-page

            // If resultsCol is not there, then try searchResults div

            var amazon_searchResults;
            if (amazon_resultsCol === null) {
                amazon_searchResults = document.getElementById('searchResults');
            }

var temp = '';
            if(amazon_resultsCol !== null) {
                var amazon_links = amazon_resultsCol.querySelectorAll('a.s-access-detail-page');
                for (i = 0; i < amazon_links.length; i++) {
                    productNames.push(amazon_links[i].textContent.toLowerCase());
temp += i + ': ' + amazon_links[i].textContent.toLowerCase() + '\r';
                }
            } else if(amazon_searchResults !== null) {
                var amazon_h3s = amazon_searchResults.querySelectorAll('h3.newaps');
                for (i = 0; i < amazon_h3s.length; i++) {
                    productNames.push(amazon_h3s[i].textContent.toLowerCase());
temp += i + ': ' + amazon_h3s[i].textContent.toLowerCase() + '\r';
                }
            }

            // product pages

            var amazon_titleSection = document.getElementById('titleSection');
            if(amazon_titleSection !== null) {
                productNames.push(amazon_titleSection.textContent.toLowerCase().trim());
temp += '> ' + amazon_titleSection.textContent.toLowerCase().trim() + '\r';
            }

if (temp.length > 20) {
    //alert(temp);
}

/*
            // Product page //

            var sainsbury_productTitleDescriptionContainers = [];

            if(sainsbury_productLister === null){

                sainsbury_productTitleDescriptionContainers = document.getElementsByClassName('productTitleDescriptionContainer');

                // The productTitleDescriptionContainer class is the box containing the product. It's a div. Inside it are:
                   // h1:                  <-- This is our product name!
                   // div: reviews

                if(sainsbury_productTitleDescriptionContainers.length > 0) {
                    var sainsbury_header1s = sainsbury_productTitleDescriptionContainers[0].getElementsByTagName('h1');
                    productNames.push(sainsbury_header1s[0].innerHTML.toLowerCase().trim());
                }
            }
*/
            if(amazon_resultsCol !== null || amazon_searchResults !== null || amazon_titleSection !== null) {
                didWeFindEverything = true;
            }

        break;
        /*
         * FASHION
         */

        case 'www.asos.com':

            // Breadcrumbs (same on search result and product page) //

            var asos_lblBreadCrumbs = document.getElementsByClassName('breadcrumb');
            if(asos_lblBreadCrumbs.length === 0){
                asos_lblBreadCrumbs = document.getElementsByClassName('breadcrumbs');
            }
            if(asos_lblBreadCrumbs.length > 0){
                breadcrumbs = asos_lblBreadCrumbs[0].textContent.toLowerCase();
            }

            // Men/women filter checkboxes //
            // This won't work yet because changing the filters doesn't refresh the page :(
            /*
            var asos_checkboxes = document.getElementsByClassName('checkbox');
            for(i = 0; i < asos_checkboxes.length; i++){
                if(asos_checkboxes[i].getAttribute('data-name') === 'MEN' && asos_checkboxes[i].getAttribute('data-checked') === 'true'){
                    menFilter = 'MEN';
                } else
                if(asos_checkboxes[i].getAttribute('data-name') === 'WOMEN' && asos_checkboxes[i].getAttribute('data-checked') === 'true'){
                    womenFilter = 'WOMEN';
                }
            }
            */

            // Search results page //

            var asos_productList;
            var asos_categoryItems = [];

            asos_productList = document.getElementsByClassName('product-list');
            // There are ASOS category pages too (google ASOS T-shirt and click the top sponsored link), which
            // have a different container div class

            if(asos_productList.length === 0){
                asos_categoryItems = document.getElementsByClassName('category-items');
            }
            // The product-list class is the grid containing all search results. It's a div. Inside it are:
               // ul:
               //   li:
               //     a:
               //       div: image-wrap
               //       div: name-fade
               //         span: class="name"            <-- This is our product name!


            if(asos_productList.length > 0) {
                var asos_spans = asos_productList[0].getElementsByTagName('span');
                for (i = 0; i < asos_spans.length; i++) {
                    if(asos_spans[i].className === 'name'){
                        productNames.push(asos_spans[i].innerHTML.toLowerCase());
                    }
                }

            // The category-items class is a bit different. It has a ul/li too, but each li contains two <a> tags,
            // one with the image and one (class=desc) with the product name
               //
               //  ...

            } else if(asos_categoryItems.length > 0){
                var asos_As = asos_categoryItems[0].querySelectorAll('a.desc');
                for (var j = 0; j < asos_As.length; j++) {
                    productNames.push(asos_As[j].textContent.toLowerCase());
                }
            }

            // Product page //
            var asos_lblProductTitle;

            if(asos_productList.length === 0 && asos_categoryItems.length === 0) {

                asos_lblProductTitle = document.getElementById('ctl00_ContentMainPage_ctlSeparateProduct_lblProductTitle');

                // The lblProductTitle class is the box containing the product. It's a div. Inside it are:
                   // div: title
                   //   h1
                   //     span           <-- This is our product name!

               if(asos_lblProductTitle !== null){
                   productNames.push(asos_lblProductTitle.textContent.toLowerCase());
               }
            }

            if(asos_lblBreadCrumbs !== null && (asos_productList.length > 0 || asos_categoryItems.length > 0 || asos_lblProductTitle !== null)) {
                didWeFindEverything = true;
            }

        break;

        case 'www.debenhams.com':

            // Breadcrumbs (same on search result and product page) //

            var debenhams_BreadCrumbTrailDisplay = document.getElementById('WC_BreadCrumbTrailDisplay_div_1');
            if(debenhams_BreadCrumbTrailDisplay !== null){
                breadcrumbs = debenhams_BreadCrumbTrailDisplay.innerHTML.toLowerCase();
            }

            // Search results page //

            var debenhams_productSelectionPage = document.getElementById('body_content_ProductSelectionPage');

            // The product-list class is the grid containing all search results. It's a div. Inside it are:
               // ul:
               //   li:
               //     a:
               //       div: image-wrap
               //       div: name-fade
               //         span: class="name"            <-- This is our product name!

            if(debenhams_productSelectionPage !== null) {
                var debenham_divs = debenhams_productSelectionPage.getElementsByClassName('description');
                for (i = 0; i < debenham_divs.length; i++) {
                    productNames.push(debenham_divs[i].textContent.toLowerCase().trim());
                }
            }

            // Product page //

            var debenhams_productTopInfo = [];

            if(debenhams_productSelectionPage === null) {

                debenhams_productTopInfo = document.getElementsByClassName('product-top-info');

                // The product-top-info class is the box containing the product name. It's a div. Inside it are a bunch of other divs, but all
                // empty until the bottom one, which contains two spans: one for the brand, one for the name. We pull them both by just pulling
                // textContent form the top div.
                   // div: pdp-header
                   //   div: content
                   //     div: title
                   //       h1: catalog-link
                   //         span: itemprop=brand
                   //         span: itemprop=name         <-- This is our product name!

               if(debenhams_productTopInfo.length > 0){
                   productNames.push(debenhams_productTopInfo[0].textContent.toLowerCase());
               }
            }

            if(debenhams_BreadCrumbTrailDisplay !== null && (debenhams_productSelectionPage !== null || debenhams_productTopInfo.length > 0)) {
                didWeFindEverything = true;
            }

        break;

        case 'www.very.co.uk':

            // Breadcrumbs (same on search result and product page) //

            var very_breadcrumb = document.getElementById('breadcrumb');
            if(very_breadcrumb !== null){
                breadcrumbs = very_breadcrumb.innerHTML.toLowerCase();
            }

            // Search results page //

            var very_product = document.getElementById('products');

            // The products div is the grid containing all search results. Inside it are:
               // ul: productList
               //   li: product
               //     div: productImages
               //     div: productInfo
               //       div: productTitle
               //         a: productTitle
               //           h3:        some text in a span        <-- This is our product name!

            if(very_product !== null) {
                var very_headers = very_products.getElementsByTagName('h3');
                for (i = 0; i < very_headers.length; i++) {
                    productNames.push(very_headers[i].textContent.toLowerCase());
                }
            }

            // Product page //

            var very_productHeadings = [];

            if(very_product === null) {

                very_productHeadings = document.getElementsByClassName('productHeading');

                // The productHeading class is the box containing the product. It's a div. Inside it is some text, some of
                // which is in a span

               if(very_productHeadings.length > 0){
                   productNames.push(very_productHeadings[0].textContent.toLowerCase());
               }
            }

            if(very_breadcrumb !== null && (very_product !== null || very_productHeadings.length > 0)) {
                didWeFindEverything = true;
            }

            break;

        case 'www.next.co.uk':

            // Breadcrumbs (same on search result and product page) //

            var next_breadcrumbNavigation = document.getElementsByClassName('BreadcrumbNavigation');
            var next_breadcrumb = [];
            if(next_breadcrumbNavigation.length > 0){
                // the li elements after the first (home) element take a while to load
                next_breadcrumbs = next_breadcrumbNavigation[0].getElementsByTagName('li');
                if(next_breadcrumbs.length > 1) {
                    breadcrumbs = next_breadcrumbNavigation[0].innerHTML.toLowerCase();
                }
            }

            // Men/women filter checkboxes //

            var next_gender1 = document.getElementById('gender1');
            var next_gender2 = document.getElementById('gender2');
            if(next_gender1 !== null && next_gender2 !== null) {
                if(next_gender1.value === 'gender:women' && next_gender1.checked === 'checked') {
                    womenFilter = 'WOMEN';
                } else
                if(next_gender1.value === 'gender:men' && next_gender1.checked === 'checked') {
                    menFilter = 'MEN';
                } else
                if(next_gender2.value === 'gender:women' && next_gender1.checked === 'checked') {
                    womenFilter = 'WOMEN';
                } else
                if(next_gender2.value === 'gender:men' && next_gender1.checked === 'checked') {
                    menFilter = 'MEN';
                }
            }

            // Search results page //

            var next_results = document.getElementsByClassName('Results');

            // The results class is the grid containing all search results. It's a div. Inside it are:
            // div: resultsHeader
            //   div: startOfResults
            //     div: page
            //       section: details
            //         div: info
            //           h2: title      <-- This is our product name!

            if(next_results.length > 0) { // the div loads empty first and is then populated by ajax, so we need to check length, not existence
                var next_headers = next_results[0].getElementsByTagName('h2');
                for (i = 0; i < next_headers.length; i++) {
                    productNames.push(next_headers[i].innerHTML.toLowerCase());
                }
            }

            // Product page //

            var next_styleHeaders = [];

            if(next_results.length === 0) {

                next_styleCopys = document.getElementsByClassName('StyleCopy');

                // The StyleCopy class is the box containing the product. It's a div. Inside it are:
                // div: StyleHeader
                //   div: Title
                //     h2             <-- This is our product name!

                // But there can be many styleCopys on the page, because Next do this thing where the whole outfit
                // of the model is itemised from head to toe. After the page finishes loading the RHS scrolls to the
                // appropriate item, which is identified by the styleCopy's parent element (<article>) having the
                // selected class. Except... the selected class is always set initially to the first item, and then
                // updates a few miliseconds later. So we are going to always delay a little if we end up with the
                // selected item also being the first item.
                // Note, it's not every product that does this, but the page structure of single-item products is the same.
                // These cases will always go through on the 10th iteration

                if(next_styleCopys.length > 0){
                    for(i = 0; i < next_styleCopys.length; i++){
                        if(next_styleCopys[i].parentElement.className.indexOf('Selected') !== -1) {
                            // if the user has happened to select a product that is displayed first in the list
                            // then they will have to wait nine iterations before we proceed. Why? Because this will
                            // hopefully give the page time to set the selected to a different product when it is, in fact,
                            // not the first item in the list after all
                            if((next_styleCopys[i].parentElement.className.indexOf('FirstItem') !== -1 && attemptCount > 9) ||
                               (next_styleCopys[i].parentElement.className.indexOf('FirstItem') === -1)){
                                next_styleHeaders = next_styleCopys[i].getElementsByClassName('StyleHeader');
                                if(next_styleHeaders.length > 0) {
                                    productNames.push(next_styleHeaders[0].textContent.toLowerCase().trim());
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            if(next_breadcrumbs.length > 1 && (next_results.length > 0 || next_styleHeaders.length > 0)) {
                didWeFindEverything = true;
            }

        break;

        case 'www.newlook.com':

            // Breadcrumbs (same on search result and product page) //

            var newlook_breadcrumbs = document.getElementsByClassName('breadcrumb');
            if(newlook_breadcrumbs.length > 0){
                breadcrumbs = newlook_breadcrumbs[0].innerHTML.toLowerCase();
            }

            // Men/women filter checkboxes //

            var newlook_breadcrumbRemoveTexts = document.getElementsByClassName('breadcrumbRemoveText');
            if(newlook_breadcrumbRemoveTexts.length > 0) {
                for(i = 0; i < newlook_breadcrumbRemoveTexts.length; i++){
                    if(newlook_breadcrumbRemoveTexts[i].innerHTML === 'Mens'){
                        menFilter = 'MEN';
                    } else
                    if(newlook_breadcrumbRemoveTexts[i].innerHTML === 'Womens'){
                        womenFilter = 'WOMEN';
                    }
                }
            }

            // Search results page //

            var newlook_prodOverviews = document.getElementsByClassName('prod_overview');

            // ul
            //   li: product
            //     div: addToWishList
            //     a: some mouse-over thing
            //     a: some hidden stuff
            //     div: prod_overview
            //       span: desc
            //         a:                <-- This is our product name!
            //       span: price

            if(newlook_prodOverviews.length > 0) {
                for(i = 0; i < newlook_prodOverviews.length; i++){
                    var newlook_descs = newlook_prodOverviews[i].getElementsByClassName('desc');
                    if(newlook_descs.length > 0){
                        productNames.push(newlook_descs[0].textContent.toLowerCase());
                    }
                }
            }

            // Product page //

            var newlook_titleContainers = [];

            if(newlook_prodOverviews.length === 0) {

                // The titlecontainer class is contains the product title only
                // h1                 <-- This is our product name!

                newlook_titleContainers = document.getElementsByClassName('title_container');
                if(newlook_titleContainers.length > 0){
                    productNames.push(newlook_titleContainers[0].textContent.toLowerCase());
                }
            }

            if(newlook_breadcrumbs.length > 0 && (newlook_prodOverviews.length > 0 || newlook_titleContainers.length > 0)) {
                didWeFindEverything = true;
            }


        break;

        case 'www.topshop.com':

            // Breadcrumbs (same on search result and product page) //

            var topshop_breadcrumbs = document.getElementsByClassName('breadcrumb');
            if(topshop_breadcrumbs.length > 0){
                breadcrumbs = topshop_breadcrumbs[0].innerHTML.toLowerCase();
            }

            // Search results page //

            topshop_wrapperPageContent = document.getElementById('wrapper_page_content');

            // There's a wrapper_page_conent on the search and product page, but the one on the search page
            // has a class of
            if(topshop_wrapperPageContent !== null) {
                if(topshop_wrapperPageContent.className !== 'category_products') {
                    topshop_wrapperPageContent = null;
                }
            }
            // wrapper_page_content is a div, containing:
            //   div: wrapper_product_list         [one for each row]
            //     div: sp_5 block_5               [example, obvs these are different for each block]
            //       ul: product
            //         li: product_image
            //         li: product_description
            //           a:                          <-- This is our product name!

            if(topshop_wrapperPageContent !== null){
                var topshop_productDescriptions = topshop_wrapperPageContent.getElementsByClassName('product_description');
                for(i = 0; i < topshop_productDescriptions.length; i++){
                    productNames.push(topshop_productDescriptions[i].textContent.toLowerCase());
                }
            }

            // Product page //

            var topshop_productColumn2 = [];

            if(topshop_wrapperPageContent === null){
                topshop_productColumn2 = document.getElementsByClassName('product_column_2');
                if(topshop_productColumn2.length > 0){
                    var topshop_headers = topshop_productColumn2[0].getElementsByTagName('h1');
                    if(topshop_headers.length > 0) {
                        productNames.push(topshop_headers[0].innerHTML.toLowerCase());
                    }
                }
            }

            // topshop is women only
            sexOverride = 'women';

            if(topshop_breadcrumbs.length > 0 && (topshop_wrapperPageContent !== null || topshop_productColumn2.length > 0)) {
                didWeFindEverything = true;
            }

        break;

        /*
         * Groceries
         */
        case 'www.tesco.com':

            runSexSearch = false;

            // Search results page //

            var tesco_allProductsGrid = document.getElementsByClassName('allProducts');

            // The allProducts class is the grid containing all search results. It's a div. Inside it are:
               // div: productLists
               //   ul: products grid (or products line for list view)
               //     li: product
               //       div: desc (or descWRap for list view)
               //         h2: (or h3 for list view)
               //           a:
               //             span class=image,
               //             span ... (special offers, price, etc)
               //             span data-title="true"                   <-- This is our product name!

            if(tesco_allProductsGrid.length > 0) {
                tescoSpans = tesco_allProductsGrid[0].getElementsByTagName('span');
                for (i = 0; i < tescoSpans.length; i++) {
                    if(tescoSpans[i].getAttribute('data-title') === 'true') {
                        productNames.push(tescoSpans[i].innerHTML.toLowerCase());
                    }
                }
            }

            // Product page //

            var tesco_productDetailsContainer = [];

            if(tesco_allProductsGrid.length === 0) {

                tesco_productDetailsContainer = document.getElementsByClassName('productDetailsContainer');

                // The productDetailsContainer class is the box containing the product. It's a div. Inside it are:
                   // div: productDescription
                   //   div: productWrapper
                   //     div: descriptionDetails
                   //       div: desc
                   //         h1:
                   //           span data-title="true"    <-- This is our product name!

                if(tesco_productDetailsContainer.length > 0) {
                    var tesco_Spans = tesco_productDetailsContainer[0].getElementsByClassName('descriptionDetails')[0].getElementsByTagName('span');
                    // there should only ever be one, but for good measure we'll loop through
                    for (i = 0; i < tesco_Spans.length; i++) {
                        if(tesco_Spans[i].getAttribute('data-title') === 'true') {
                            productNames.push(tesco_Spans[i].innerHTML.toLowerCase());
                        }
                    }
                }
            }

            if(tesco_allProductsGrid.length > 0 || tesco_productDetailsContainer.length > 0) {
                didWeFindEverything = true;
            }

        break;

        case 'www.sainsburys.co.uk':

            runSexSearch = false;

            // Search results page //

            var sainsbury_productLister = document.getElementById('productLister');

            // The productLister div is the grid containing all search results. Inside it are:
               // div: productLister
               //   ul: productLister (gridview class as well for grid view)
               //     li: gridItem   (no class name for list view)
               //       div: product
               //         for list view: div: productInner, div: productInfoWrapper, div: productInfo
               //         for grid view: div: productNameAndPromotions
               //           h3:
               //             span:
               //             a:
               //               text                   <-- This is our product name!
               //               img:
               //           div: promotion

            if(sainsbury_productLister !== null) {
                var sainsbury_header3s = sainsbury_productLister.getElementsByTagName('h3');
                for (i = 0; i < sainsbury_header3s.length; i++) {
                    productNames.push(sainsbury_header3s[i].innerHTML.toLowerCase());
                }
            }

            // Product page //

            var sainsbury_productTitleDescriptionContainers = [];

            if(sainsbury_productLister === null){

                sainsbury_productTitleDescriptionContainers = document.getElementsByClassName('productTitleDescriptionContainer');

                // The productTitleDescriptionContainer class is the box containing the product. It's a div. Inside it are:
                   // h1:                  <-- This is our product name!
                   // div: reviews

                if(sainsbury_productTitleDescriptionContainers.length > 0) {
                    var sainsbury_header1s = sainsbury_productTitleDescriptionContainers[0].getElementsByTagName('h1');
                    productNames.push(sainsbury_header1s[0].innerHTML.toLowerCase().trim());
                }
            }

            if(sainsbury_productLister !== null || sainsbury_productTitleDescriptionContainers.length > 0) {
                didWeFindEverything = true;
            }

        break;

        //case 'groceries.asda.com':
        // for archived  Asda code, see bottom of script
        //break;

        default:
            log(gvScriptName_CSSearch + '.getElements: no switch statement written for active website: ' + websiteURL,'ERROR');

    }

    /**************************************
     * Call the relevant search functions *
     **************************************/

    if(!didWeFindEverything && attemptCount < 10) {
        // If we don't have any productNames yet then we try the page a few times, in case it has any fancy ajax-esque loading of the search results
        window.setTimeout(function(){attemptCount++; return getElements(tabURL,websiteURL,sexSearch,productSearch,searchData,attemptCount);},100);
    } else if (productNames.length > 0) {
        var pageElements = {productNames: productNames,
                            breadcrumbs:  breadcrumbs,
                            URLText:      URLText,
                            menFilter:    menFilter,
                            womenFilter:  womenFilter,
                            sexOverride:  sexOverride};

        if(runSexSearch) {
            sexSearchCallback(pageElements,websiteURL,productSearchCallback,searchData);
        } else {
            productSearchCallback(pageElements,websiteURL,searchData);
        }
    } else {
        log(gvScriptName_CSSearch + '.getElements: Failed to pull expected elements from the DOM on websiteURL == ' + websiteURL,'ERROR');
        // No need to call our search functions, just return no search results
        processSearchResults(null,null,false);
    }
}

/*
 * Search the various page elements for the searchProduct sex
 */
function sexSearch(pageElements, websiteURL, productSearchCallback, searchData) {

    log(gvScriptName_CSSearch + '.sexSearch: Start','PROCS');

    var foundMen = false;
    var foundWomen = false;

    if (pageElements.sexOverride === 'women'){
        foundWomen = true;
    } else if (pageElements.sexOverride === 'men'){
        foundMen = true;
    } else {


         // Some of the searchProducts will be sex-specific, so we need to see if we can identify
         // a sex-specific category/search on the current page

         // The first thing to do is see if we have search filters for sex
         if(pageElements.menFilter === 'WOMEN') {
             foundWomen = true;
         }
         if(pageElements.womenFilter === 'MEN') {
             foundMen = true;
         }
         // Next, check the URL for a sex
         if (pageElements.URLText.indexOf('women') > -1 || pageElements.URLText.indexOf('female') > -1) {
             foundWomen = true;
         } else if (pageElements.URLText.indexOf('men') > -1 || pageElements.URLText.indexOf('male') > -1) {
             foundMen = true;
         }

         // Next, look in the breadcrumbs in the hope that the user has navigated to the item via a men/women category or included sex in their search term
         if (pageElements.breadcrumbs) {
             if(!foundMen && !foundWomen) {
                 if (pageElements.breadcrumbs.indexOf('women') > -1 ||
                     pageElements.breadcrumbs.indexOf('woman') > -1 ||
                     pageElements.breadcrumbs.indexOf('lady') > -1 ||
                     pageElements.breadcrumbs.indexOf('female') > -1) {
                     foundWomen = true;

                 } else if (pageElements.breadcrumbs.indexOf('men') > -1 ||
                            pageElements.breadcrumbs.indexOf('man') > -1 ||
                            pageElements.breadcrumbs.indexOf('male') > -1) {

                     foundMen = true;
                 }
             }
         }

         // Next, let's see whether the sex is in the product name. Don't run this for multi item pages otherwise a single word containing "men" on a women's items list can prevent the sidebar showing at all (asos, skirts)
         // To do: this should be better than this. Move this sub-sex search into product search level so it only applies to the relevant product
         if (pageElements.productNames.length === 1) {
             for (i = 0; i < pageElements.productNames.length; i++){
                 if(!foundMen && !foundWomen) {
                     if (pageElements.productNames[i].indexOf('women') > -1 ||
                         pageElements.productNames[i].indexOf('woman') > -1 ||
                         pageElements.productNames[i].indexOf('lady') > -1 ||
                         pageElements.productNames[i].indexOf('female') > -1) {
                         foundWomen = true;
                         break;
                     } else if (pageElements.productNames[i].indexOf('men') > -1 ||
                                pageElements.productNames[i].indexOf('man') > -1 ||
                                pageElements.productNames[i].indexOf('male') > -1) {
                         foundMen = true;
                         break;
                     }
                 }
             }
         }

         log(gvScriptName_CSSearch + '.sexSearch: results >>> foundMen == ' + foundMen + ', foundWomen == ' + foundWomen,'DEBUG');

         // If we've found nothing, let's just ignore sex to ensure results come back - even if we return both men and women results
         if(!foundMen && !foundWomen){
             foundMen = true;
             foundWomen = true;
         }
     }

     pageElements.useSex = true;
     pageElements.foundMen = foundMen;
     pageElements.foundWomen = foundWomen;

     productSearchCallback(pageElements,websiteURL,searchData);
}

/*
 * Search the various page elements for the searchProduct product search terms
 */
function productSearch(pageElements,websiteURL,searchData) {

    log(gvScriptName_CSSearch + '.productSearch: Start','PROCS');

    var functionName = 'productSearch';

    var searchResults = [];
    var productGroupNamesArray = [];

    var foundSomething = false;
    var position_brand;
    var position_searchTerm1;
    var position_searchTerm2;
    var position_searchTerm3;
    var position_searchTerm4;
    var position_searchTerm5;
    var position_searchTerm6;
    var position_searchTerm7;
    var position_negativeSearchTerm1;
    var position_negativeSearchTerm2;
    var position_negativeSearchTerm3;
    var position_negativeSearchTerm4;
    var matchedSex;

    // for each searchProduct
    for (var i = 0; i < searchData.length; i++) {

        position_brand = -1;
        position_searchTerm1 = -1;
        position_searchTerm2 = -1;
        position_searchTerm3 = -1;
        position_searchTerm4 = -1;
        position_searchTerm5 = -1;
        position_searchTerm6 = -1;
        position_searchTerm7 = -1;
        position_negativeSearchTerm1 = -1;
        position_negativeSearchTerm2 = -1;
        position_negativeSearchTerm3 = -1;
        position_negativeSearchTerm4 = -1;
        matchedSex = false;

        // Only search for this searchProduct if it belongs to a searchCategory that is valid for the user's current website
        if(searchData[i].websiteURL === websiteURL) {

            // for each product on the users web page (may be single product screen; may be multi product search results etc)
            // Go through all of them and tally a score of how many hits we get. This will help us order our results.
            var foundThisItemInThisElement = false;
            var excludeThisItemInThisElement = false;
            var howManyTimesHaveWeMatchedSearchProduct = 0;
            for (j = 0; j < pageElements.productNames.length; j++) {

                if(searchData[i].brand_LC !== 'all') {
                    position_brand = pageElements.productNames[j].indexOf(searchData[i].brand_LC);
                } else {
                    position_brand = -2;
                }

                if(searchData[i].searchTerm1 !== '') {
//                    alert(pageElements.productNames[j] + ' - index of - ' + searchData[i].searchTerm1_LC);
                    position_searchTerm1 = pageElements.productNames[j].indexOf(searchData[i].searchTerm1_LC);
                } else {
                    position_searchTerm1 = -2;
                }

                if(searchData[i].searchTerm2 !== '') {
                    position_searchTerm2 = pageElements.productNames[j].indexOf(searchData[i].searchTerm2_LC);
                } else{
                    position_searchTerm2 = -2;
                }

                if(searchData[i].searchTerm3 !== '') {
                    position_searchTerm3 = pageElements.productNames[j].indexOf(searchData[i].searchTerm3_LC);
                } else{
                    position_searchTerm3 = -2;
                }

                if(searchData[i].searchTerm4 !== '') {
                    position_searchTerm4 = pageElements.productNames[j].indexOf(searchData[i].searchTerm4_LC);
                } else{
                    position_searchTerm4 = -2;
                }

                if(searchData[i].searchTerm5 !== '') {
                    position_searchTerm5 = pageElements.productNames[j].indexOf(searchData[i].searchTerm5_LC);
                } else{
                    position_searchTerm5 = -2;
                }

                if(searchData[i].searchTerm6 !== '') {
                    position_searchTerm6 = pageElements.productNames[j].indexOf(searchData[i].searchTerm6_LC);
                } else{
                    position_searchTerm6 = -2;
                }

                if(searchData[i].searchTerm7 !== '') {
                    position_searchTerm7 = pageElements.productNames[j].indexOf(searchData[i].searchTerm7_LC);
                } else{
                    position_searchTerm7 = -2;
                }

                if(searchData[i].negativeSearchTerm1 !== '') {
                    position_negativeSearchTerm1 = pageElements.productNames[j].indexOf(searchData[i].negativeSearchTerm1_LC);
                } else{
                    position_negativeSearchTerm1 = -2;
                }

                if(searchData[i].negativeSearchTerm2 !== '') {
                    position_negativeSearchTerm2 = pageElements.productNames[j].indexOf(searchData[i].negativeSearchTerm2_LC);
                } else{
                    position_negativeSearchTerm2 = -2;
                }

                if(searchData[i].negativeSearchTerm3 !== '') {
                    position_negativeSearchTerm3 = pageElements.productNames[j].indexOf(searchData[i].negativeSearchTerm3_LC);
                } else{
                    position_negativeSearchTerm3 = -2;
                }

                if(searchData[i].negativeSearchTerm4 !== '') {
                    position_negativeSearchTerm4 = pageElements.productNames[j].indexOf(searchData[i].negativeSearchTerm4_LC);
                } else{
                    position_negativeSearchTerm4 = -2;
                }

                // If we're doing a search that requires a match on sex then pageElements.useSex will have been set by the sexSearch function
                // Otherwise, skip sex entirely and call it a pass
                if (pageElements.useSex) {
                    // if this SearchProduct has no sex specified, then we want to set this to a successful match and move on
                    if (searchData[i].sex === ''){
                        matchedSex = true;
                    } else {
                        // If we found mention of both man and woman item, then this is a pass regardless of what's on the searchProduct
                        if(pageElements.foundMen && pageElements.foundWomen) {
                            matchedSex = true;
                        } else {
                            if (searchData[i].sex_LC === 'men' && pageElements.foundMen) {
                                matchedSex = true;
                            } else if (searchData[i].sex_LC === 'women' && pageElements.foundWomen) {
                                matchedSex = true;
                            } else {
                                matchedSex = false;
                            }
                        }
                    }
                } else {
                    matchedSex = true; // this avoids failing the final condition of the function in cases where we don't need to match a sex.
                }

                // To do: For fashion I've taken brand out of the equation, because there are so many and I reckon anything on ASOS-proper
                // is worthy of recommendation. All brands for fashion are set to "All"
                // Hence, we're effectively just working at productGroup level, e.g. a searchProduct would be called T-Shirt, or Jeans, etc.
                // Eventually I'd like to build a brands table, mabye work by exception rather than inclusion...?

                // Firsty, see whether we're using OR conditions or AND conditions

                foundThisItemInThisElement = false;
                excludeThisItemInThisElement = false;

                // We've set our position vars to -2 if the searchProduct didn't have a searchTerm entered.
                // This way we can ignore blank values for AND (i.e. a product with all blank values will always return)
                // and take them into account for OR (i.e. a product with one blank value will NOT always return!)
                if(searchData[i].andOr === 'AND') {
                    if((position_brand > -1      || position_brand === -2)          &&
                       ((position_searchTerm1 > -1 || position_searchTerm1 === -2)  &&
                        (position_searchTerm2 > -1 || position_searchTerm2 === -2)  &&
                        (position_searchTerm3 > -1 || position_searchTerm3 === -2)  &&
                        (position_searchTerm4 > -1 || position_searchTerm4 === -2)  &&
                        (position_searchTerm5 > -1 || position_searchTerm5 === -2)  &&
                        (position_searchTerm6 > -1 || position_searchTerm6 === -2)  &&
                        (position_searchTerm7 > -1 || position_searchTerm7 === -2)) && matchedSex) {

                        foundThisItemInThisElement = true;

                    }
                }
                // For our negative AND search, it's just like above except that if they are all blank we don't want to exclude
                // the searchProduct (because negativeSearchTerms are an optional feature)
                if(searchData[i].negativeAndOr === 'AND') {

                    if(((position_negativeSearchTerm1 > -1 || position_negativeSearchTerm1 === -2)  &&
                        (position_negativeSearchTerm2 > -1 || position_negativeSearchTerm2 === -2)  &&
                        (position_negativeSearchTerm3 > -1 || position_negativeSearchTerm3 === -2)  &&
                        (position_negativeSearchTerm4 > -1 || position_negativeSearchTerm4 === -2)) &&
                       !(position_negativeSearchTerm1 === -2 &&
                         position_negativeSearchTerm2 === -2 &&
                         position_negativeSearchTerm3 === -2 &&
                         position_negativeSearchTerm4 === -2)) {

                        excludeThisItemInThisElement = true;
                    }
                }

                if(searchData[i].andOr === 'OR') {
/*
                    if(searchData[i].productName === 'Cheese'){

                        alert('searchData.brand == ' + searchData[i].brand + ', pageElements.productNames == ' + pageElements.productNames[j] + ', position_brand == ' + position_brand);
                        alert('searchData[i].searchTerm1 == ' + searchData[i].searchTerm1 + ' (searchTerm1_LC == ' + searchData[i].searchTerm1_LC + '), pageElements.productNames == ' + pageElements.productNames[j] + ', position_searchTerm1 == ' + position_searchTerm1);
                        alert('searchData[i].searchTerm2 == ' + searchData[i].searchTerm2 + ' (searchTerm2_LC == ' + searchData[i].searchTerm2_LC + '), pageElements.productNames == ' + pageElements.productNames[j] + ', position_searchTerm2 == ' + position_searchTerm2);
                        alert('searchData[i].searchTerm3 == ' + searchData[i].searchTerm3 + ' (searchTerm3_LC == ' + searchData[i].searchTerm3_LC + '), pageElements.productNames == ' + pageElements.productNames[j] + ', position_searchTerm3 == ' + position_searchTerm3);
                        alert('searchData[i].searchTerm4 == ' + searchData[i].searchTerm4 + ' (searchTerm4_LC == ' + searchData[i].searchTerm4_LC + '), pageElements.productNames == ' + pageElements.productNames[j] + ', position_searchTerm4 == ' + position_searchTerm4);
                        alert('searchData[i].searchTerm5 == ' + searchData[i].searchTerm5 + ' (searchTerm5_LC == ' + searchData[i].searchTerm5_LC + '), pageElements.productNames == ' + pageElements.productNames[j] + ', position_searchTerm5 == ' + position_searchTerm5);
                        alert('searchData[i].searchTerm6 == ' + searchData[i].searchTerm6 + ' (searchTerm6_LC == ' + searchData[i].searchTerm6_LC + '), pageElements.productNames == ' + pageElements.productNames[j] + ', position_searchTerm6 == ' + position_searchTerm6);
                        alert('searchData[i].searchTerm7 == ' + searchData[i].searchTerm7 + ' (searchTerm7_LC == ' + searchData[i].searchTerm7_LC + '), pageElements.productNames == ' + pageElements.productNames[j] + ', position_searchTerm7 == ' + position_searchTerm7);

                        alert(position_brand);
                        alert(position_searchTerm1);
                        alert(matchedSex);

                    }

                    */


                    if ((position_brand > -1 || position_brand === -2) &&
                        (position_searchTerm1 > -1 ||
                         position_searchTerm2 > -1 ||
                         position_searchTerm3 > -1 ||
                         position_searchTerm4 > -1 ||
                         position_searchTerm5 > -1 ||
                         position_searchTerm6 > -1 ||
                         position_searchTerm7 > -1) && matchedSex) {

                        foundThisItemInThisElement = true;
                    }
                }

                if(searchData[i].negativeAndOr === 'OR') {

                    if((position_negativeSearchTerm1 > -1 ||
                        position_negativeSearchTerm2 > -1 ||
                        position_negativeSearchTerm3 > -1 ||
                        position_negativeSearchTerm4 > -1)) {

                            excludeThisItemInThisElement = true;
                    }
                }

                if (foundThisItemInThisElement && !excludeThisItemInThisElement) {
                    howManyTimesHaveWeMatchedSearchProduct++;
                }

            } // This is the end of the loop that cycles through the page elements

            searchData[i].numberOfSearchHits = howManyTimesHaveWeMatchedSearchProduct;

            if (howManyTimesHaveWeMatchedSearchProduct > 0) {
                searchResults.push(searchData[i]);
                foundSomething = true;
            }

        } // this is the end of the if statement that checks the searchProduct is valid on this website

    } // This is the end of the loop that cycles through the searchData array (i.e. a blown out list of searchProducts)

    userLog('SEARCH',{searchWebsite: websiteURL, searchAlgorithmFunction: functionName, searchProductsFound: searchResults.length});

    log(gvScriptName_CSSearch + '.productSearch: results >>> searchResults.length == ' + searchResults.length,'DEBUG');
    // This is usually going to be content_script.receiveSearchResults
    processSearchResults(searchResults,foundSomething);

}




/*
        case 'groceries.asda.com':

            runSexSearch = false;
            var asdaSpans;

            // Two cases, multi-items or single item.
            // Check multi-items first and if no elements found, check single item

            var listings = document.getElementsByClassName('listings');
            // The allProducts class is the grid containing all search results. It's a div. Inside it are:
               // div: listings
               //   div: listing
               //     div: container
               //       div: slider
               //         div: product
               //           div: product-contnet
               //             span: title
               //               a:           (Title contains product name)
               //                 span:                        <-- This is our product name!

            if(listings[0]) {

                // First things first, Asda doesn't refresh the page so we need to keep an eye on the listsings DOM from now on

                if(!observeDOM) { // only if we haven't already done this . To do: this won't work if we are opening multiple tabs? :(

                        var observeDOM = (function(){
                        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
                            eventListenerSupported = window.addEventListener;

                        return function(obj, callback){
                            if( MutationObserver ){
                                // define a new observer
                                var obs = new MutationObserver(function(mutations, observer){
                                    if( mutations[0].addedNodes.length || mutations[0].removedNodes.length )
                                        callback();
                                });
                                // have the observer observe foo for changes in children
                                obs.observe( obj, { childList:true, subtree:true });
                            }
                            else if( eventListenerSupported ){
                                obj.addEventListener('DOMNodeInserted', callback, false);
                                obj.addEventListener('DOMNodeRemoved', callback, false);
                            }
                        };
                    })();

                    // Observe a specific DOM element:
                    observeDOM( document.getElementById('listings') ,function(){

                        console.log(gvScriptName_CSSearch + '.getElements: ASDA DOM changed',' INFO');
                        getElements(websiteURL,sexSearchCallback,productSearchCallback,searchData,attemptCount);
                    });
                }

                // Now go ahead and pull out our spans

                asdaSpans = listings[0].getElementsByTagName('span');
                for (i = 0; i < asdaSpans.length; i++) {
                    if(asdaSpans[i].getAttribute('class') === 'title') {
                        productNames.push(asdaSpans[i].textContent.toLowerCase());
                    }
                }
            } *//*else {
                var productDetailsContainer = document.getElementsByClassName('productDetailsContainer');
                // The productDetailsContainer class is the box containing the product. It's a div. Inside it are:
                   // div: productDescription
                   //   div: productWrapper
                   //     div: descriptionDetails
                   //       div: desc
                   //         h1:
                   //           span data-title="true"    <-- This is our product name!

                if(productDetailsContainer[0]) {
                    asdaSpans = productDetailsContainer[0].getElementsByClassName('descriptionDetails')[0].getElementsByTagName('span');
                    for (i = 0; i < asdaSpans.length; i++) {
                        if(asdaSpans[i].getAttribute('data-title') === 'true') {
                            productNames.push(asdaSpans[i].innerHTML.toLowerCase());
                        }
                    }
                }
            }*/
/*
        break;
*/