# How to Build Your First MiniDapp

This is a brief (and irreverent) doc' to get you started creating your first Minima MiniDapp. And in the best traditions of Computing, the MiniDapp this doc' creates outputs:

"Hello (decentralised) World".

## Prerequisites

First, clone the [MiFi](https://github.com/glowkeeper/MiFi) repository to a local directory (since you're reading a file in that repository, you _may_ have already done that).

Then clone the [Minima](https://github.com/spartacusrex99/Minima) repository to a local directory. Change to that directory, and type:

````
java -jar ./jar/minima.jar

````

Importantly, for our purposes, that command fires up a MiniDapp server on port 21000 of our local machine. We'll use that, later.

As a brief aside, you could also start the MiniDapp server via:

````
java org.minima.Start

````

That could come in useful later should you ever need (or want) to change something in the Minima source.

## Creatively Commandeer

There is no need to start from scratch, as a number of MiniDapps have already been created. So for the purposes of this tutorial, we're going to re-engineer [cowsay](https://github.com/glowkeeper/MiFi/www/minidapps/cowsay). Change to your cloned MiFi directory, then:

```
cd www/minidapps
cp -R cowsay helloWorld

```

If all has gone well, you should now have a helloWorld directory containing all the goodness (and more). Load that directory up into your favourite IDE - here's what it that looks like in my IDE of choice, ([atom](https://atom.io/)

![](./helloWorld.png)
