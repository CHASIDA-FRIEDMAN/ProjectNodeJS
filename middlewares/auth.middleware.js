import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
    try {
        console.log('hello auth!')
        const { authorization } = req.headers;
        console.log(authorization)
        const [, token] = authorization.split(' ');
        console.log(token)
        const secretKey = process.env.JWT_SECRET || 'JWT_SECRET';

        // אימות הטוקן
        const user = jwt.verify(token, secretKey);
        console.log('user:',user)
        if (!user) {
            return next({ status: 403, message: 'auth required' });
        }

        // נעביר את המשתמש לראוטר
        req.user = user;

        console.log('req:',req)
        next();
        // אם יש בעיה, נשלח הודעת שגיאה
    }
    catch (err) {
        next({ status: 403, message: 'auth required' });

    }
}

export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next({ status: 403, message: 'you are not authorized only admin authorized' });
    }
    next();
}