# Big Five Personality Test - Nederlandse Versie

Dit is een aangepaste versie van de Big Five persoonlijkheidstest, specifiek geconfigureerd voor Nederlandse gebruikers.

## Belangrijke Wijzigingen

- **Nederlandse standaardtaal**: De applicatie gebruikt nu Nederlands als standaardtaal
- **Geen resultaten voor gebruikers**: Na het invullen van de test zien gebruikers een bedankpagina in plaats van hun resultaten
- **Admin interface**: Alleen de beheerder kan alle testresultaten bekijken via `/admin`
- **Docker ondersteuning**: Eenvoudige deployment met Docker

## Quick Start met Docker

1. **Clone en configureer het project:**
   ```bash
   git clone <jouw-repo>
   cd bigfive-web
   ```

2. **Wijzig het admin wachtwoord:**
   Open `docker-compose.yml` en wijzig deze regel:
   ```yaml
   - ADMIN_PASSWORD=jouwgeheimwachtwoord123
   ```
   Vervang `jouwgeheimwachtwoord123` door jouw eigen veilige wachtwoord.

3. **Start de applicatie:**
   ```bash
   docker-compose up -d
   ```

4. **Test de applicatie:**
   - Ga naar: http://localhost:3000 (voor de test)
   - Admin interface: http://localhost:3000/admin (gebruik jouw wachtwoord)

## Lokale Development (zonder Docker)

1. **Installeer dependencies:**
   ```bash
   cd web
   npm install -g pnpm
   pnpm install
   ```

2. **Start MongoDB:**
   ```bash
   # Optie 1: Met Docker
   docker run -d -p 27017:27017 --name mongo -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=mongopassword123 mongo:7.0
   
   # Optie 2: Lokale MongoDB installatie
   # Zorg dat MongoDB draait op localhost:27017
   ```

3. **Configureer environment:**
   ```bash
   cd web
   cp .env.local.example .env.local
   # Bewerk .env.local indien nodig
   ```

4. **Start de development server:**
   ```bash
   pnpm dev
   ```

## Deployment op een Server

### Optie 1: Docker (Aanbevolen)

1. **Upload bestanden naar je server**
2. **Installeer Docker en Docker Compose**
3. **Wijzig wachtwoorden in docker-compose.yml**
4. **Start met: `docker-compose up -d`**

### Optie 2: Traditionele deployment

1. **Installeer Node.js en MongoDB op je server**
2. **Clone de repository**
3. **Configureer .env.local met productie instellingen**
4. **Build en start:**
   ```bash
   cd web
   pnpm install
   pnpm build
   pnpm start
   ```

## Hoe Het Werkt

### Voor Testnemers:
1. Ga naar jouw website
2. Vul de Nederlandse persoonlijkheidstest in
3. Krijg een bedankpagina te zien (geen resultaten)

### Voor Jou (Admin):
1. Ga naar `/admin` op jouw website
2. Log in met het wachtwoord dat je hebt ingesteld
3. Bekijk alle testresultaten met persoonlijkheidsscores
4. Gebruik deze data voor je grappige presentatie!

## Testresultaten Gebruiken

Elk testresultaat bevat:
- **Persoonlijkheidsdomeinen**: Openheid, Consciëntieusheid, Extraversie, Vriendelijkheid, Neuroticisme
- **Scores**: Numerieke waarden en categorieën (hoog/neutraal/laag)
- **Timing**: Hoe lang iemand over de test heeft gedaan
- **Volledige antwoorden**: Alle individuele antwoorden

## Beveiliging

- **Admin wachtwoord**: Verander het standaard wachtwoord!
- **Database**: MongoDB is standaard beschermd
- **HTTPS**: Zorg voor SSL/TLS certificaten in productie

## Aanpassingen

### Wachtwoord wijzigen:
1. **Docker**: Bewerk `docker-compose.yml`
2. **Lokaal**: Bewerk `.env.local`

### Andere aanpassingen:
- **Kleuren/styling**: Bewerk bestanden in `web/src/`
- **Teksten**: Bewerk `web/src/messages/nl.js`
- **Database**: Standaard MongoDB, andere databases mogelijk met aanpassingen

## Troubleshooting

### Website draait niet:
```bash
docker-compose logs web
```

### Database problemen:
```bash
docker-compose logs mongodb
```

### Poorten in gebruik:
Wijzig poorten in `docker-compose.yml`:
```yaml
ports:
  - '8080:3000'  # Website nu op poort 8080
```

### Admin login werkt niet:
- Controleer het wachtwoord in docker-compose.yml
- Kijk naar de browser console voor foutmeldingen

## Support

Dit is een aangepaste versie voor persoonlijk gebruik. Voor vragen over de originele Big Five test, zie: https://github.com/rubynor/bigfive-web

Veel plezier met je grappige presentatie! 🎉