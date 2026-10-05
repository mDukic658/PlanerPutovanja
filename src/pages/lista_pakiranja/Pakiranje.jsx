export default function Pakiranje({ pakiranje, predmeti, promijeni }) {

    const predmet = predmeti.find(
        (stavka) => stavka.sifra === pakiranje.predmetSifra
    )

    return (
        <div>
            <input
                type="checkbox"
                checked={pakiranje.spakirano}
                onChange={() =>
                    promijeni(
                        pakiranje.predmetSifra,
                        pakiranje.putovanjeSifra
                    )
                }
            />

            {' '}

            {predmet && predmet.naziv}
        </div>
    )
}