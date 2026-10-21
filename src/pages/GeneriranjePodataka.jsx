import { base, en, Faker, hr } from "@faker-js/faker";
import { useState } from "react";
import { Button, Form, Alert, Container, Row, Col } from "react-bootstrap";
import DrzaveService from '../services/drzave/DrzaveService'
import PredmetiService from '../services/predmeti/PredmetiService'
import PutovanjaService from '../services/putovanja/PutovanjaService'
import PakiranjaService from '../services/lista_pakiranja/PakiranjaService'

export default function GeneriranjePodataka() {

    const [brojDrzava, setBrojDrzava] = useState(10)
    const [brojPredmeta, setBrojPredmeta] = useState(30)
    const [brojPutovanja, setBrojPutovanja] = useState(10)
    const [brojPakiranja, setBrojPakiranja] = useState(10)
    const [poruka, setPoruka] = useState(null)
    const [loading, setLoading] = useState(false)

    const faker = new Faker({
        locale: [hr, en, base]
    })

    const generirajDrzave = async (broj) => {
        for (let i = 0; i < broj; i++) {
            await DrzaveService.dodaj({
                naziv: faker.location.country(),
                kod: faker.location.countryCode('alpha-2')
            })

        }
    }

    const generirajPredmete = async (broj) => {

        const nazivi = [
            'Putovnica', 'Odjeća', 'Četkica za zube', 'Punjač',
            'Adapter za struju', 'Topla odjeća', 'Kišna jakna',
            'Ljetna odjeća', 'Sunčane naočale', 'Kapa i rukavice',
            'Fotoaparat', 'Lijekovi', 'Krema za sunčanje', 'Knjiga',
            'Slušalice', 'Baterija', 'Čarape', 'Šampon', 'Ručnik', 'Novčanik'
        ]

        for (let i = 0; i < broj; i++) {
            await PredmetiService.dodaj({
                naziv: nazivi[i % nazivi.length] +
                    (i >= nazivi.length ? `${Math.floor(i / nazivi.length) + 1}` : '')
            })
        }
    }

    const generirajPutovanja = async (broj) => {
        const rezultat = await DrzaveService.get()
        const drzave = rezultat.data

        if (drzave.length === 0) {
            throw new Error('Nema dostupnih država. Prvo generirajte države.')
        }

        for (let i = 0; i < broj; i++) {
            const randomDrzava = drzave[faker.number.int({ min: 0, max: drzave.length - 1 })]
            const datumPolaska = faker.date.soon({ days: 365 })
            const grad = faker.location.city()

            await PutovanjaService.dodaj({
                naziv: 'Putovanje u ' + grad,
                destinacija: grad,
                drzava: randomDrzava.naziv,
                datumPolaska: datumPolaska.toISOString().split('T')[0],
                datumPovratka: faker.date.soon({ days: 20, refDate: datumPolaska }).toISOString().split('T')[0],
                budzet: faker.number.int({ min: 500, max: 5000 })
            })
        }
    }

    const generirajPakiranja = async (broj) => {

        const rezultatiPredmeti = await PredmetiService.get()
        const predmeti = rezultatiPredmeti.data

        const rezultatiPutovanja = await PutovanjaService.get()
        const putovanja = rezultatiPutovanja.data

        if (predmeti.length === 0 || putovanja.length === 0) {
            throw new Error('Nema dostupnih predmeta ili putovanja. Prvo ih generirajte.');
        }

        for (let i = 0; i < broj; i++) {
            const randomPredmet = predmeti[faker.number.int({ min: 0, max: predmeti.length - 1 })]
            const randomPutovanje = putovanja[faker.number.int({ min: 0, max: putovanja.length - 1 })]

            await PakiranjaService.dodaj({
                predmetSifra: randomPredmet.sifra,
                putovanjeSifra: randomPutovanje.sifra,
                spakirano: faker.datatype.boolean()
            })
        }
    }

    const obrisiSve = async (servis, naziv) => {
        if (!window.confirm(`Jeste li sigurni da želite obrisati sve ${naziv}?`)) {
            return;
        }

        setLoading(true)
        setPoruka(null)

        try {
            const rezultat = await servis.get()
            const podaci = rezultat.data

            for (const item of podaci) {
                await servis.obrisi(item.sifra)
            }

            setPoruka({
                tip: 'success',
                tekst: `Uspješno obrisano ${podaci.length} ${naziv}!`
            });
        } catch (error) {
            setPoruka({
                tip: 'danger',
                tekst: `Greška pri brisanju ${naziv}: ` + error.message
            })
        } finally {
            setLoading(false)
        }
    }

    const handleGeneriraj = async (e, generiraj, broj, naziv) => {
        e.preventDefault()
        setLoading(true)
        setPoruka(null)

        try {
            await generiraj(broj);
            setPoruka({
                tip: 'success',
                tekst: `Uspješno generirano ${broj} ${naziv}!`
            })
        } catch (error) {
            setPoruka({
                tip: 'danger',
                tekst: `Greška pri generiranju ${naziv}: ` + error.message
            })
        } finally {
            setLoading(false)
        }
    }

    const kartaGeneriranja = [
        {
            naziv: 'Države',
            broj: brojDrzava,
            setBroj: setBrojDrzava,
            max: 195,
            generiraj: (broj) => generirajDrzave(broj),
            handler: (e) => handleGeneriraj(e, generirajDrzave, brojDrzava, 'država')
        },
        {
            naziv: 'Predmeti',
            broj: brojPredmeta,
            setBroj: setBrojPredmeta,
            max: 50,
            generiraj: (broj) => generirajPredmete(broj),
            handler: (e) => handleGeneriraj(e, generirajPredmete, brojPredmeta, 'predmeta')
        },
        {
            naziv: 'Putovanja',
            broj: brojPutovanja,
            setBroj: setBrojPutovanja,
            max: 50,
            generiraj: (broj) => generirajPutovanja(broj),
            handler: (e) => handleGeneriraj(e, generirajPutovanja, brojPutovanja, 'putovanja')
        },
        {
            naziv: 'Pakiranja',
            broj: brojPakiranja,
            setBroj: setBrojPakiranja,
            max: 200,
            generiraj: (broj) => generirajPakiranja(broj),
            handler: (e) => handleGeneriraj(e, generirajPakiranja, brojPakiranja, 'pakiranja')
        }
    ]

    return (

        <Container className="mt-4">
            <h1>Generiranje podataka</h1>
            <p className="text-muted">
                Generirajte testne podatke s lažnim (fake) podacima na hrvatskom jeziku.
            </p>

            {poruka && (
                <Alert variant={poruka.tip} dismissible onClose={() => setPoruka(null)}>
                    {poruka.tekst}
                </Alert>
            )}

            <Row>
                {kartaGeneriranja.map((k) => (
                    <Col md={3} key={k.naziv}>
                        <Form onSubmit={k.handler}>
                            <Form.Group className="mb-3">
                                <Form.Label>Broj {k.naziv.toLowerCase()}</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    max={k.max}
                                    value={k.broj}
                                    onChange={(e) => k.setBroj(parseInt(e.target.value))}
                                    disabled={loading}
                                />
                                <Form.Text className="text-muted">
                                    1-{k.max}
                                </Form.Text>
                            </Form.Group>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={loading}
                                className="w-100"
                            >
                                {loading ? 'Generiranje...' : `Generiraj ${k.naziv.toLowerCase()}`}
                            </Button>
                        </Form>
                    </Col>
                ))}
            </Row>

            <Alert variant="warning" className="mt-3">
                <strong>Upozorenje:</strong> Ove akcije dodaju nove podatke u postojeće.
                Ako želite početi ispočetka, prvo obrišite postojeće podatke.
            </Alert>

            <hr className="my-4" />

            <h3>Brisanje podataka</h3>
            <p className="text-muted">
                Koristite ove opcije za brisanje svih podataka iz baze.
            </p>

            <Row className="mt-3">
                <Col md={3}>
                    <Button variant="danger" onClick={() => obrisiSve(DrzaveService, 'država')}
                        disabled={loading} className="w-100 mb-2">
                        {loading ? 'Brisanje...' : 'Obriši sve države'}
                    </Button>
                </Col>
                <Col md={3}>
                    <Button variant="danger" onClick={() => obrisiSve(PredmetiService, 'predmeta')}
                        disabled={loading} className="w-100 mb-2">
                        {loading ? 'Brisanje...' : 'Obriši sve predmete'}
                    </Button>
                </Col>
                <Col md={3}>
                    <Button variant="danger" onClick={() => obrisiSve(PutovanjaService, 'putovanja')}
                        disabled={loading} className="w-100 mb-2">
                        {loading ? 'Brisanje...' : 'Obriši sva putovanja'}
                    </Button>
                </Col>
                <Col md={3}>
                    <Button variant="danger" onClick={() => obrisiSve(PakiranjaService, 'pakiranja')}
                        disabled={loading} className="w-100 mb-2">
                        {loading ? 'Brisanje...' : 'Obriši sva pakiranja'}
                    </Button>
                </Col>
            </Row>

            <Alert variant="danger" className="mt-3">
                <strong>Oprez!</strong> Brisanje podataka je trajna akcija i ne može se poništiti.
            </Alert>
        </Container>

    )

}