import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
    try {
        const { authorization } = req.headers;
        const [, token] = authorization.split(' ');
        const secretKey = process.env.JWT_SECRET || 'JWT_SECRET';

        // אימות הטוקן
        const user = jwt.verify(token, secretKey);
        if (!user) {
            return next({ status: 403, message: 'auth required' });
        }

        // נעביר את המשתמש לראוטר
        req.user = user;
        next();
        // אם יש בעיה, נשלח הודעת שגיאה
    }
    catch (err) {
        next({ status: 403, message: 'auth required' });

    }
}

export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next({ status: 403, message: 'you are not authorized' });
    }
    next();
}