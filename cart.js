/**
 * Gets current books in cart
 * @returns {string} - String representation of cart
 */
function getBooks() {
    return localStorage.getItem('books')
}

/**
 * Gets current books in json form
 * @returns {Object} - JSON of current books
 */
function jsonBooks() {
    return JSON.parse(getBooks())
}

/**
 * Gets current quantity and subtotal for cart
 * @returns {string} - String representation of cart
 */
function getCart() {
    return localStorage.getItem('cart')
}

/**
 * Creates an alert that shows what currently in cart 
 * @returns {string} - Output of what is in cart
 */
function cartAlert() {
    var output = ""
    var books = jsonBooks()
    var cart = jsonCart()

    for(var b in books){
        var a = [b, books[b].unitPrice, books[b].quantity, books[b].totalCost]
        output += a.join('  ') + '\n'
    }
    
    output += "\nItem(s): " +  cart.count + "\n"
    output += "Subtotal: " + cart.subtotal
    alert(output)

    return output
}

/**
 * Gets current quantity and subtotal for cart in JSON form
 * @returns {Object} - JSON of quantity and subtotal of cart
 */
function jsonCart() {
    return JSON.parse(getCart())
}

jQuery(document).ready(function ($) {
    if (localStorage.getItem('books') === null) {
        localStorage.setItem('books', JSON.stringify({}))
    }

    if (localStorage.getItem('cart') === null) {
        localStorage.setItem('cart', JSON.stringify({
            'count': 0,
            'subtotal': 0.00
        }))
    }

    /**
     * Waits for JQuery selector before executing function
     * @param {string} selector 
     * @param {requestCallback|requestCallback[]} cb 
     */
    function waitForSelector(selector, cb) {
        if ($(selector).length) {
            console.log('Selector found!')
            if (Array.isArray(cb)){
                cb.forEach(function(func) {
                    console.log('Executing', func.name, '...')
                    func()
                })
            } else {
                cb()
            }
        } else {
            setTimeout(function () {
                console.log("Waiting for selector...")
                waitForSelector(selector, cb)
            }, 1000)
        }
    }

    /**
     * Parses add cart modal for quantity and subtotal
     */
    function parseAddCartData() {
        var cart = JSON.parse(localStorage.getItem('cart'))
        var retailPrice = parseFloat($('#divSuggestedPrice')
            .find('.ATC_divContentTableText').text()
            .match(/[+-]?(\d*\.?\d+)/))
        var cokesburyPrice = parseFloat($('#divCokesburyPrice')
            .find('.ATC_divContentTableText').find('.spanSpecialPrice').text()
            .match(/[+-]?(\d*\.?\d+)/))

        var unitPrice = cokesburyPrice ? cokesburyPrice : retailPrice

        localStorage.setItem('cart', JSON.stringify({
            "count": cart['count'] += 1,
            "subtotal": cart['subtotal'] += unitPrice
        }, null, 2))
    }

    /**
     * Parses add cart modal for book information
     */
    function parseAddBookData() {
        var books = JSON.parse(localStorage.getItem('books'))

        var title = $('.ATC_divTitle').text()
        var retailPrice = parseFloat($('#divSuggestedPrice')
            .find('.ATC_divContentTableText').text()
            .match(/[+-]?(\d*\.?\d+)/))
        var cokesburyPrice = parseFloat($('#divCokesburyPrice')
            .find('.ATC_divContentTableText').find('.spanSpecialPrice').text()
            .match(/[+-]?(\d*\.?\d+)/))

        var unitPrice = cokesburyPrice ? cokesburyPrice : retailPrice

        if (title in books) {
            if ('quantity' in books[title]) {
                books[title]['quantity'] += 1
                books[title]['totalCost'] = books[title]['quantity'] * unitPrice
            } else {
                books[title]['quantity'] = 1
                books[title]['totalCost'] = unitPrice
            }
        } else {
            books[title] = {
                "subtitle": $('#divSubtitle').text(),
                "author": $('#divAuthor').find('.ATC_divContentTableText')
                    .text(),
                "publisher": $('#divPublisher').find('.ATC_divContentTableText')
                    .text(),
                "publicationDate": $('#divPublicationDate')
                    .find('.ATC_divContentTableText').text(),
                "isbn": $('#divIsbn13').find('.ATC_divContentTableText').text(),
                "retailPrice": retailPrice,
                "unitPrice": unitPrice,
                'quantity': 1,
                'totalCost': unitPrice
            }
        }

        localStorage.setItem('books', JSON.stringify(books, null, 2))
    }

    /**
     * Parses cart page for book information
     */
    function parseCartBookData() {
        var books = {}

        $('.trShoppingCartItem').each(function () {
            var title = $(this).find('.divCartTitle').find('a').text()

            books[title] = {
                "subtitle": $(this).find('.divCartSubtitle').text(),
                "isbn": $(this).find('.divCartNumber').html().split(': ')[1],
                "unitPrice": parseFloat($(this).find('.tdShoppingCartPrice')
                    .text().match(/[+-]?(\d*[.]?\d+)/)),
                "quantity": parseInt($(this).find('input.inputQty').val()),
                "totalCost": parseFloat($(this).find('.tdShoppingCartTotal')
                    .text().match(/[+-]?(\d*[.]?\d+)/))
            }
        })

        localStorage.setItem('books', JSON.stringify(books, null, 2))
    }

    /**
     * Parses cart page for quantity and subtotal of cart
     */
    function parseCartData() {
        localStorage.setItem('cart', JSON.stringify({
            "count": parseInt($('.tdOrderSummaryLabel').text().match(/\d+/)),
            "subtotal": parseFloat($('#tdSubtotalContents').text()
                .match(/[+-]?(\d*[.]?\d+)/))
        }))
    }

    // Add listeners to Add Cart button on product pages
    $(":submit.btnCokesburyAction.js-add-button").click(function () {
        waitForSelector(
            ".ATC_divModalWrapper", 
            [parseAddBookData, parseAddCartData]
        )
    })

    // Get cart information when on the cart checkout page
    if (window.location.pathname.toLowerCase() === 
        "/forms/checkout/shoppingcart.aspx") {
        if ($(".divShoppingCartContentWrapper").length) {
            waitForSelector("table.tblShoppingCartContent", parseCartBookData)
            waitForSelector("table.tblOrderSummary", parseCartData)
        } else {
            localStorage.setItem('books', JSON.stringify({}))
            localStorage.setItem('cart', JSON.stringify({
                'count': 0,
                'subtotal': 0.00
            }))
        }
    }
})
