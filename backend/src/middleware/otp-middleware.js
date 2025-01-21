const validateMobileNumber = (req, res, next) => {
    const { mobileNumber } = req.body;
    const phoneRegex = /\b(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?[\d-.\s]{7,10}\b/;

    if (!phoneRegex.test(mobileNumber)) {
        return res.status(400).json({ message: 'Invalid mobile number format' });
    }

    next();
};
