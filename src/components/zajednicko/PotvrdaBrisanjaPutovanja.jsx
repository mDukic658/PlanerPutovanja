import PotvrdaBrisanja from "./PotvrdaBrisanja"

export default function PotvrdaBrisanjaPutovanja({
    putovanje,
    brisanjeUTijeku,
    onOdustani,
    onPotvrdi
}) {
    return (
        <PotvrdaBrisanja
            otvoreno={putovanje !== null}
            naslov="Brisanje putovanja"
            tekstPotvrde="Obriši putovanje"
            brisanjeUTijeku={brisanjeUTijeku}
            onOdustani={onOdustani}
            onPotvrdi={onPotvrdi}
        >
            Želiš li obrisati putovanje „{putovanje?.naziv}”?
            Obrisat će se i njegova pakiranja, stavke itinerara,
            troškovi i fotografije.
        </PotvrdaBrisanja>
    )
}