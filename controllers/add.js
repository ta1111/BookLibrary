const fs = require('fs');
const path = require('path');
module.exports = {
    'GET /addBook': async (ctx, next) => {
        var userID = ctx.cookies.get('userID', {
            signed: true
        });
        if (userID === 'admin') ctx.render('addBook.njk');
        else return next();
    },
    'POST /addBook': async (ctx, next) => {
        var
            bookID = ctx.request.body.bookID,
            bookName = ctx.request.body.bookName,
            eBook = ctx.request.files.eBook;

        var book = await ctx.findOrCreate('books', bookID, {
            bookName: bookName,
            author: ctx.request.body.author,
            press: ctx.request.body.press,
            pending: 0,
            lending: 0,
            returning: 0,
            returned: ctx.request.body.number,
            eBook: ctx.request.files.eBook.name
        });
        if (book[1]) {
            if (eBook) {
                console.log(JSON.stringify(ctx.ebook));

                if (ctx.ebook[bookID])
                    return render('addBook.njk', {
                        message: {
                            type: 'negative',
                            head: 'Add Book Error:',
                            body: 'The bookID ' + bookID + ' is being handled by another.'
                        }
                    });
                ctx.ebook[bookID] = 1;

                var
                    reader = fs.createReadStream(ctx.request.files.eBook.path),
                    writer = fs.createWriteStream(path.join('./eBooks', bookID));
                await reader.pipe(writer);

                ctx.ebook[bookID] = 0;
            }

            ctx.render('addBook.njk', {
                message: {
                    type: 'success',
                    head: 'Add Book Success',
                    body: 'You have added the book: ' + bookName + '(' + bookID + ')'
                }
            });
        }
        else ctx.render('addBook.njk', {
            message: {
                type: 'negative',
                head: 'Add Book Failed',
                body: 'The bookID ' + bookID + ' has existed.'
            }
        });
    },

    'GET /addUser': async (ctx, next) => {
        var userID = ctx.cookies.get('userID', {
            signed: true
        });
        if (userID === 'admin') ctx.render('addUser.njk');
        else return next();
    },
    'POST /addUser': async (ctx, next) => {
        var userID = ctx.request.body.userID,
            userName = ctx.request.body.userName;

        var user = await ctx.findOrCreate('users', userID, {
            password: ctx.request.body.password,
            userName: userName
        });
        if (user[1]) ctx.render('addUser.njk', {
            message: {
                type: 'success',
                head: 'Add User Success:',
                body: 'Username: ' + userID + ', Name: ' + userName
            }
        });
        else ctx.render('addUser.njk', {
            message: {
                type: 'negative',
                head: 'Add User Error:',
                body: 'Username ' + userID + ' has been used.'
            }
        });
    }
};