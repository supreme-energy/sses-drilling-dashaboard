
## Fork the repo and make sure it works

```bash
yarn
yarn start
yarn test
```

## Add gitattributes to improve cross platform line endings

```bash
cp ../Auction-Web-Client/.gitattributes .
git add .gitattributes
git commit -m "add gitattributes file"
```

## eslint customization

Changed `.eslintrc` then:

```bash
yarn run lint:fix
yarn run lint
git commit -am "changed lint rules"
```

## set Project code style for WebStorm to match eslint

Fiddle with WebStorm JS Code style options, making sure to use "Project Scheme" until it formats code that
lint does not complain about.  This makes a file `.idea/codeStyleSettings.xml`

Update gitignore so we can commit this file.  Replace:

```
.idea/
```

with

```
.idea/**
.idea/**/
!.idea/codeStyleSettings.xml
```

Now commit:

```bash
git add .gitignore
git add .idea/
```
