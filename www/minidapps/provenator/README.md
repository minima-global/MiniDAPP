# Provenator

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](/docs/COPYING.txt)

Provenator is an application for proving the origins of captured digital media. It uses cryptographic tools and blockchain technology; by using the trust mechanisms of blockchains, the application aims to show, beyond doubt, the provenance of any source of digital media.

Provenator is the result of the academic paper called, [Fake News - a Technological Approach to Proving Provenance Using Blockchains](https://doi.org/10.1089/big.2017.0071), by Steve Huckle and Martin White, of the [University of Sussex Informatics Department](http://www.sussex.ac.uk/informatics/), which was published in a special issue on Computational Propaganda and Political Big Data for Mary Anne Liebert's [Big Data Journal](http://online.liebertpub.com/toc/big/5/4).

## Table of Contents

- [Built Using](#built-using)  
- [Install](#install)
  - [Dependencies](#dependencies)
- [Maintainer](#maintainer)
- [Contributing](#contributing)
- [License](#license)

## Built Using

- [Minima](https://github.com/minima-global/Minima)
- [Minima MiniDapps](https://github.com/minima-global/MiniDAPP)
- [node](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)
- [React](https://reactjs.org/)

## Install

The instructions below will install Provenator as a [Minima MiniDapps](https://github.com/minima-global/MiniDAPP).

1. From a command-line, change to the same directory as this README
 and type `npm install`. That will install everything listed in [package.json](/package.json), which are the components of the [React](https://reactjs.org/) frontend to this application
2. Build the [React](https://reactjs.org/) frontend by typing `npm run prod`
3. Run `./buildscript.sh`. That will create the Provenator [Minima MiniDapps](https://github.com/minima-global/MiniDAPP)

Now run the [Minima blockchain](https://github.com/minima-global/Minima). That creates a MiniDapp Server, which is accessible via [http://localhost:9004](http://localhost:9004). So start a browser, and load [http://localhost:9004](http://localhost:9004). You should see the MiniDapp homepage.

Click on `Install`, then go find the `provenator.minidapp` you created in Step 3, above.

You should now be able to open the Provenator MiniDapp and use it to add provenance to your digital assets.

### Dependencies

You must have the following dependencies installed:

- [Minima](https://github.com/minima-global/Minima)
- [node](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)

## Maintainer

[Steve Huckle](https://glowkeeper.github.io/).

## Contributing

Contributions welcome - please email [Steve Huckle](https://glowkeeper.github.io/).

## License

GNU General Public License v3.0.
