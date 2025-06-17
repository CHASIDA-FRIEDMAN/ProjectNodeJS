export const notFound = (req, res, next) => {
    next({ status: 404, message: 'url not found' });
}

export const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'internal server error';
    res.status(status).json({ error: message ,fixMail: 'fix@gmail.com'});
}