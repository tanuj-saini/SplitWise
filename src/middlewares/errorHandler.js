import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        // Handle custom API errors
        return res
            .status(err.statusCode)
            .json(new ApiResponse(err.statusCode, null, err.message, err.errors));
    }

    // Log the error for debugging
    console.error(err);

    // Handle unexpected errors
    return res
        .status(500)
        .json(new ApiResponse(500, null, "Internal Server Error"));
};

export default errorHandler;
