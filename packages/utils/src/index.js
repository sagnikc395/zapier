"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionDetails = void 0;
exports.formatDateTimeToCustomString = formatDateTimeToCustomString;
// date time help utilities
function formatDateTimeToCustomString(dateTime) {
    const options = {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZoneName: "short",
    };
    const parsedDateTime = dateTime instanceof Date ? dateTime : new Date(dateTime);
    return parsedDateTime.toLocaleString("en-US", options);
}
const getSessionDetails = () => {
    let session = {
        token: "",
        user: {},
    };
    if (localStorage.getItem("user") !== null &&
        localStorage.getItem("token") !== null) {
        session = {
            token: localStorage.getItem("token"),
            user: JSON.parse(localStorage.getItem("user")),
        };
    }
    return session;
};
exports.getSessionDetails = getSessionDetails;
//# sourceMappingURL=index.js.map