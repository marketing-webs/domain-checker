const getErrorFromMessage = (errorMsg = '') => {
    const errors = {
        ENOTFOUND: "Domena nie istnieje (brak nazwy w DNS)",
        ENODATA: "Brak rekordu A / AAAA (domena istnieje, ale nie ma IP)",
        ETIMEOUT: "Przekroczono limit czasu operacji (Timeout)",
        ETIMEDOUT: "Przekroczono limit czasu połączenia (Connection timed out)",
        EAI_AGAIN: "Tymczasowy problem z resolverem DNS (spróbuj ponownie)",
        ECONNREFUSED: "Połączenie odrzucone (serwer działa, ale nic nie nasłuchuje na porcie)",
        ECONNRESET: "Połączenie zostało zresetowane przez hosta",
        EHOSTUNREACH: "Host nieosiągalny (np. problem z routingiem lub siecią)",
        ENETUNREACH: "Sieć nieosiągalna",
        EADDRNOTAVAIL: "Lokalny adres IP niedostępny (rzadkie)",
        EPIPE: "Zerwane połączenie (Broken pipe)",
        UNKNOWN: "Nieznany błąd DNS lub sieci",
    };

    for (const key of Object.keys(errors)) {
        if (errorMsg.includes(key)) {
            return `${errorMsg} - ${errors[key]}`;
        }
    }

    return errorMsg;
};

module.exports.getErrorFromMessage = getErrorFromMessage