# How to Build Your First MiniDapp

This is a brief doc' to get you started creating your first Minima MiniDapp. And in the best traditions of Computing, this MiniDapp outputs a version of those immortal words, _"Hello World"_. Obvs.

## Prerequisites

First, clone the [MiFi](https://github.com/glowkeeper/MiFi) repository to a local directory (since you're reading a file in that repository, you _may_ have already done that).

Then do the same with the [Minima](https://github.com/spartacusrex99/Minima) repository. Change to its directory, and type:

````
java -jar ./jar/minima.jar

````

Importantly, for our purposes, that command fires up a MiniDapp server on port [21000](http://localhost:2100) of your local machine. We'll use that, later.

As a brief aside, you could also start the MiniDapp server via:

````
cd bin

java org.minima.Start

````

That could come in useful to you sometime in the future, should you ever need (or want) to change something in the Minima source, since when you build that source, the `bin` directory is where the build gets compiled.

## Creatively Commandeer

There is no need to start from scratch - the [MiFi](https://github.com/glowkeeper/MiFi) repository  already contains a number of MiniDapps, so we'll commandeer one of those - [cowsay](https://github.com/glowkeeper/MiFi/www/minidapps/cowsay). Change to your cloned MiFi directory, then:

```
cd www/minidapps
cp -R cowsay helloWorld

```

If all has gone well, you should now have a `helloWorld` directory containing all the goodness (and more) of [cowsay](https://github.com/glowkeeper/MiFi/www/minidapps/cowsay). Open that directory in your favourite IDE - here's what it that looks like in my IDE of choice, ([atom](https://atom.io/)):

![](./helloWorld.png)

## Make Hello World

First thing we're going to do is tidy up a bit by removing things we don't need and renaming those that we do:

1. Rename `cowsay.css` to `helloWorld.css`.
2. Rename all the files in the `images` directory so they say `helloWorld`, rather than cowsay. Better still, if you are able to create your own amazing artwork for `helloWorldBackdrop.png`, `helloWorldBody.png` and `helloWorldicon.png`, do so now ;)
3. Remove the `cowsay.js` and `io.js` files from the4 `js`, as they are no longer required (fyi, `io,js` controls all the, er, io, for the cowsay MiniDapp, and `cowsay.js` was a CommonJS port of https://github.com/schacon/cowsay).

Now your Directory should look something similar to this:

![](./hellowWorldCleanup.png)

We're going to make the helloWorld MiniDapp say, well, _"Hello World!"_ (or something similar). Edit `index.html`, and make it look like this:

![](./helloWorldIndex.png)

Finally, make your `minidapp.conf` look like this:

![](./helloWorldConf.png)

## Zip up your (first) MiniDapp

If you look in the directory containing all the MiniDapps, you'll see a file called `buildscript.sh`. Add `helloWorld` to the end of that:

![](helloWorldBuild.png)

Now drop out of your favourite editor (if it's not [atom](https://atom.io/), why not?), and run `buildscript.sh`. If all went well, you should have a number of `.minidapp` files in you MiFi repository's [www/minidapps/bin](www/minidapps/bin) directory, including `helloWorld.minidapp`. Time to make it do its job (say hello to the world)!

## Hello World!

[Earlier](#prerequisites), we fired up a MiniDapp server on port 21000 - we're going to connect to that now. Load your favourite browser (Firefox)(https://www.mozilla.org/en-GB/firefox/new/), and load this url:

```
http://localhost:21000

```

If all has gone well, you should see something like this:

![](miniDappServer.png)

Let's add `helloWorld`! Click on `Install`, then go find the `helloWorld.minidapp` we created earlier. If that went well, your screen should now look like this:

![](helloWorldMiniDappServer.png)

Now, click on the `Hello World MiniDapp`, and you _should_ see this:

![](helloDecentralisedWorld.png)

**Boom!** Congratulations! Welcome to the world of Minima MiniDapps!

## What Next?

Although `helloWorld.minidapp` is fit for purpose (it outputs "hello World!" (almost)), it doesn't actually interact with the Minima network. So the obvious next step is to do just that and investigate the Minima API. A good way of seeing what's available there is to run the terminal minidapp (which we created earlier when we ran `buildscript.sh`). Install that, load it, then type help:

![](helloWorldTerminal.png)

You could get some ideas from the other minidapps, too - for example, [cowsay](https://github.com/glowkeeper/MiFi/www/minidapps/cowsay) makes use of the Minima `random` command. But there are endless more possibilities...

Good luck!
