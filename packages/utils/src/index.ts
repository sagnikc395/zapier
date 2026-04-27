// date time help utilities
export function formatDateTimeToCustomString(dateTime: string | Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  };

  const parsedDateTime =
    dateTime instanceof Date ? dateTime : new Date(dateTime);

  return parsedDateTime.toLocaleString("en-US", options);
}

export const getSessionDetails = () => {
  let session = {
    token: "",
    user: {},
  };
  if (
    typeof window !== "undefined" &&
    localStorage.getItem("user") !== null &&
    localStorage.getItem("token") !== null
  ) {
    session = {
      token: localStorage.getItem("token") as string,
      user: JSON.parse(localStorage.getItem("user") as string),
    };
  }

  return session;
};
