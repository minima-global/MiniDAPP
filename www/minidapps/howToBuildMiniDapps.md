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

If all has gone well, you should now have a helloWorld directory containing all the goodness (and more). Load that directory up into your favourite IDE - here's what it that looks like in my IDE of choice, ([atom](https://atom.io/)):

![](./helloWorld.png)

First thing we're going to do is tidy up a bit by removing things we don't need and renaming those that we do:

1. Rename [css/cowsay.css](css/cowsay.css) to [css/helloWorld.css](css/helloWorld.css).
2. Rename all the respective files in the [images](images) directory so they say `helloWorld`. Better still, if you manage to create your own amazing `helloWorldBackdrop.png`, `helloWorldBody.png` and `helloWorldicon.png` -artwork, do so now and put them in that images directory.
3. In the [js](js) directory, remove the `cowsay.js` and `io.js` files, as they are no longer required. Fyi, `io,js` controls all the, er, io, for the cowsay MiniDapp, and was written specifically for that job. `cowsay.js` was a CommonJS port into MiniDapps of https://github.com/schacon/cowsay.

Now your Directory should look something similar to this:

![](./hellowWorldCleanup.png)

Now we're going to make the helloWorld MiniDapp say, well, "Hello World" (or something similar). Open up [index.html](helloWorld/index.html), and make it look like this:

![](./helloWorldIndex.png)

Finally, make you minidapp.conf look like this:

![](./helloWorldConf.png)

## Zip up your (first) MiniDapp

If you look in the directory containing all the MiniDapps, you'll see a file called `buildscript.sh`, which creates all the MiniDapps on the main repository. Add `helloWorld` to the end of that:

![](helloWorldBuild.png)

Now drop out of your favourite editor ([atom](https://atom.io/)), and run `buildscript.sh`. If all went well, you should have a number of `.minidapp` files in [bin](./bin), including `helloWorld.minidapp`. Time to load it up into a browser!

## Hello World!

[Earlier](#prerequisites), we fired up a MiniDapp server on port 21000 - we're going to connect to that now - load your favourite browser (Firefox)(https://www.mozilla.org/en-GB/firefox/new/), and load this url:

```
http://localhost:21000

```

If all has gone well, you should see something like this:

![](miniDappServer.png)

Let's add our first MiniDapp - helloWorld! Click on `Install`, then go find the `helloWorld.minidapp` we created earlier. If that went well, your screen should now look like this:

![](helloWorldMiniDappServer.png)

Now, click on the `Hello World MiniDapp`, and you _should_ see this:

![](helloDecentralisedWorld.png)

**Boom!** Congratulations! Welcome to the world of Minima MiniDapps!

## What Next?

Although `helloWorld.minidapp` is fit for purpose (it outputs "hello World!" (almost)), it doesn't actually interact with the Minima network. So the obvious next step is to do just that and investigate the Minima API. A good way of seeing what's available there is to run the terminal minidapp (which we created earlier when we ran `buildscript.sh`). Install that, load it, then type help:

![](helloWorldTerminal.png)

You could also get some ideas from the other minidapps (for example, [cowsay](https://github.com/glowkeeper/MiFi/www/minidapps/cowsay) makes use of the Minima `random` command).

Good luck!
