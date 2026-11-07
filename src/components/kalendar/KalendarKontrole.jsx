import { Button } from "react-bootstrap";
import dayjs from "dayjs";

export default function KalendarKontrole({
    godisnjiPrikaz,
    datumKalendara,
    datumPolaska,
    onPrikaziKalendar,
    onPrikaziGodinu,
    onPromijeniGodinu,
    onTrenutnaGodina,
    onPrekiniOdabir
}) {
    return (
        <>
            {/* Odabir kalendarskog ili godišnjeg prikaza */}

            <div className="kalendar-prikazi d-flex flex-wrap align-items-center gap-2 mb-3">
                <Button
                    type="button"
                    variant={godisnjiPrikaz ? "outline-primary" : "primary"}
                    onClick={onPrikaziKalendar}
                >
                    Kalendar
                </Button>

                <Button
                    type="button"
                    variant={godisnjiPrikaz ? "primary" : "outline-primary"}
                    onClick={onPrikaziGodinu}
                >
                    Godina
                </Button>
            </div>

            {/* Navigacija kroz godine */}

            {godisnjiPrikaz && (
                <div className="kalendar-godina-kontrole d-flex flex-wrap align-items-center gap-3 mb-3">
                    <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={() => onPromijeniGodinu(-1)}
                    >
                        Prethodna godina
                    </Button>

                    <strong>
                        {dayjs(datumKalendara).year()}
                    </strong>

                    <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={() => onPromijeniGodinu(1)}
                    >
                        Sljedeća godina
                    </Button>

                    <Button
                        type="button"
                        variant="outline-primary"
                        onClick={onTrenutnaGodina}
                    >
                        Ova godina
                    </Button>
                </div>
            )}

            {/* Uputa za odabir datuma putovanja */}

            {datumPolaska ? (
                <div className="kalendar-uputa kalendar-uputa-odabir d-flex align-items-center gap-3 mb-3">
                    <span>
                        Polazak: {dayjs(datumPolaska).format("DD.MM.YYYY.")}
                        {" — "}Sada odaberite datum povratka.
                    </span>

                    <Button
                        type="button"
                        variant="outline-secondary"
                        size="sm"
                        onClick={onPrekiniOdabir}
                    >
                        Odustani
                    </Button>
                </div>
            ) : (
                <p className="kalendar-uputa">
                    {godisnjiPrikaz
                        ? "Kliknite mjesec za otvaranje njegova kalendara. Plavo su označena putovanja, a narančastom točkom aktivnosti."
                        : "Kliknite datum polaska, zatim datum povratka za dodavanje putovanja."}
                </p>
            )}
        </>
    )
}