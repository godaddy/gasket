---
title: Making Frameworks
date: 2019-11-26 11:00:00 -0700
description: A look at how we develop Node.js apps today and how we
  can do it better using Gasket to quickly compose reusable elements of apps
  into feature-rich frameworks
slug: making-frameworks
authors: agerard
tags: [Node.js, Framework, Plugin, How-To]
hide_table_of_contents: false
---

Building apps with similar sets of features is universal across software
development. Integrating app features such as renders, routers, and state
managers can be cumbersome, so developers tend to find solutions to avoid doing
it more than once. In this article, we are going to be considering frameworks,
how we make them today, and how we can make them better and more feature-rich.
While the concept of a framework is not tied to a particular programming
language, we will be focusing on Node.js based applications and tooling.

<!-- truncate -->

## How to make a framework?

Now, when you hear the word framework, you might be thinking, "I don't like
frameworks, they're too restrictive." Or maybe, "Frameworks are too bulky. I
don't need the whole kitchen sink and its features for my apps. Just give me
libraries and let me piece together my apps the way I want."

So let's say that you decide to build an app without a framework, and you have
gone through the process of determining which features your app needs. You have
selected libraries for the features, and you are ready to stitch those pieces
together to build your app. After tediously integrating these, you can finally
implement the contents of the app itself. Now, you have a pretty good app! You
continue to iterate on it, tweak some things for performance, improve some code
here and there, but now your manager or client asks you to build another app
quite similar to this one.

What do you do? Do you start this process over again? Can you take your current
work and build from it? Likely you'll copy the first project, gut the pieces
that are specific to that app, and refit it with content for the next app. So,
guess what you just did? You made a framework! By copying your previous app, you
found a way to develop multiple apps using common patterns and feature sets. Or
put another way, a framework upon which to build more apps.

## Is there a better way?

Since you already know how to make a framework, why should you keep reading?
Because, quite simply, there is a better way to make a framework. Let's look at
some of the approaches and problems of building frameworks with what is
available to us today.

### Scaffolding

To avoid gutting one app every time you need to make another, you can build a
trimmed-down starter app and push it to a repository (repo). You can now clone
your starter repo and jump right into building your new app. Starter kit
boilerplate repos are a typical pattern which
[GitHub is littered with][starter repos].

Yet, even when cloning an app repo, there is still a decent amount of fixup to
do. You need to untie it from the original repo, or wipe the old repo files and
re-init it. Or, install and use [degit] to copy the repo without commit history.
And still, you likely need to change the app name and some defaults in several
places to truly get started.

Alternatively, you can create an app generator. Something like
[create-react-app] can save a few steps when spinning up new apps, but an
existing generator may limit the features in your framework unless you build one
yourself. If you decide to trudge through the depths of making an app generator,
there is also [Yeoman], which provides a more composable approach.

However, whether copying repos to create new apps or generating them, these
approaches will present a few cascading maintenance problems as the number of
apps you develop grows.

#### Problem: Maintenance

Problems with apps from mere starter repos or generators may not present
themselves until you are a few apps into it. Say one of the libraries you use
has a new release with some cool new features, but the API has changed. You
can't just upgrade your apps with the latest version of the package, as you also
have to update the integration code that lives within your apps. What do you do?
If there aren't too many apps and the change is relatively simple, maybe you can
make the change along with the package upgrade. If there are other teams
building apps off of your starter kit, perhaps you submit PRs to their repos
too. Otherwise, you will need to write up a guide on how to upgrade that library
and hope they update their app accordingly.

Either way, this can be a big chore for you and anyone who utilized your starter
app. Wouldn't it be better if your integration code did not have to be updated
directly in each specific app?

### Packages

To reduce the amount of library integration code residing in your apps, you can
extract it to a separate package. This approach allows you to centralize your
library integrations into a distinct package so that you don't have all that
integration code sitting in your apps (where you have to maintain it). When it's
time for an important library to be upgraded, it can be done in your integration
package, then consuming apps only need to upgrade your package.

Using packages can also help with code organization in your app, drawing a finer
line between where the framework code ends and the app code begins. However,
this approach is not without caveats.

#### Problem: Fixed Features

By extracting library integrations into separate packages, you create a sort of
black box for consuming developers. This forces app developers towards the
package's specific integrations, making it difficult to tie in new features, and
near impossible to remove or change existing ones. While that may be suitable
for some frameworks and teams, if you want to support experimentation and
differentiation for apps using your framework, you should leave the door open
for at least some app-specific configurations.

Avoiding a fixed amount of features can be managed by limiting the scope of your
integration package and/or by providing integration package choices, which can
then be composited into apps.

### Configuration

To allow choices or options in your framework, you might consider a more
configurable approach. By providing a way to configure your framework,
developers using your framework can adjust it in expected ways. If you know up
front that there are a few integration choices for a feature, you could even
provide those as turnkey plugins. Maybe the whole kitchen sink is available as
plugins, but now developers can pick and choose as they need for their apps.

#### Problem: Limited scope

There are some common difficulties encountered when developing a plugins system,
like in determining where plugins can tie into the framework. The framework
should provide enough configurable parts to be useful without being overly
complicated, but that largely depends on the scope of your framework. This can
be a tricky balance.

For example, [Next.js] is a fantastic framework package that does a great job
integrating React with routing and server-side rendering solutions along with
Webpack. It supports configuration, but really only ties into the build and
start settings and Webpack config. For instance, Next.js doesn't dictate what
server engine or state management libraries you can use, nor does it provide a
pluggable way to integrate them. You have to implement these yourself, as that
decision is outside the framework's scope.

#### Problem: Limited use

Another factor to consider in framework configurability is the runtime aspects
of applications. With mere configuration, how can apps tie in various actions or
events that your framework may perform during the life of a running app's
process? This can be done with an event system, allowing your app to subscribe
to events emitted during various points in the app's life. An event system can
also allow for different layers of an app to communicate in flexible ways.

## Is this really better?

Now, you may be thinking, "This is a lot of work for a framework. Instead of
just copying an app and refitting it, you're asking me to generate my
scaffolding, implement integrations in separate packages, allow for
configurations, and now support an event system?"

Well, yes, but fortunately, there is something that can help. Something that can
make frameworks more fully-featured beyond what we've discussed so far, and that
makes frameworks easier to assemble than a simple starter app.

# Introducing Gasket

At GoDaddy, we created tooling to help facilitate the development of the Node.js
frameworks we use internally, and the good news is: we will be open-sourcing
this tooling we call Gasket!

Gasket helps teams and communities compose frameworks to deliver apps of various
shapes and sizes. It provides all the elements you need to make a robust
framework meeting the needs from what we have discussed so far.

## CLI

To begin with, Gasket has a command-line interface that you can use to generate
an app and to interact with it upon creation. The Gasket CLI is the foundation
to build your framework on and to run your apps. Different commands exist to run
apps as you would expect, such as 'build' and 'start'. You can also create new
apps using the 'create' command.

## Commands

Commands can do anything you want with your app. For example, you can run a
command to analyze a web app's bundle size or run a command that displays docs.
Commands are what initiate various lifecycles within apps. Since we have been
discussing the use of frameworks for starting new apps, we will look more
closely at Gasket's built-in 'create' command from here on.

When running the 'create' command, the create lifecycle is executed. When
lifecycles are executed, they can be hooked by plugins.

## Plugins

Plugins can hook various lifecycles issued by commands, execute additional
lifecycles, and even introduce additional commands. Plugins are the composable
packages that integrate libraries and provide features for apps.

By hooking the create lifecycle, plugins can install libraries and generate the
necessary scaffolding code where needed. Gasket plugins provide a composable
approach to generating apps. Somewhat like composable generators from the
aforementioned Yeoman. However, Gasket plugins are not merely for generating,
but also stick around in the app for runtime uses.

So, if a framework is a common set of patterns and features upon which you can
build apps, how does all this tooling constitute a framework?

## Presets

As we have discussed, Gasket gives you the foundation to generate an app, run
it, and tie into or introduce various lifecycles by way of plugins. Upon
determining what plugins you wish to reuse across your apps, these can be
stamped into a preset. The known set of features upon which you can build your
apps are now in the reusable preset, effectively, the framework.

By specifying the preset when using the Gasket create command to generate a new
app, the app will be created with all the features from the plugins you have
selected for the preset!

# Conclusion

And now we are back to where we began, with a feature set we would like to build
our apps from. However, what was once just a copied-around app with some glued
together libraries, is now a preset of plugins using Gasket. Making your
framework with Gasket plugins in a composable way allows code to be easily
maintained and versioned. Establishing plugins into presets allows them to be
easily shared to benefit other app and framework developers. Gasket's modular
approach also enables development collaboration, allowing plugins and presets to
be contributed to and improved by others.

Whether you utilize Node.js to build web apps, services, CLI tools, or
otherwise, you can now use Gasket to quickly compose your reusable features to
make your frameworks!

## From here

Get started and involved! Stay tuned for more details as we announce our open
source release of Gasket soon at [Node+JS Interactive 2019][njsi2019]. If you
are attending the conference, I hope to see you at my talk,
[Gasket: Framework Maker][njsi2019 talk]!


[degit]: https://github.com/Rich-Harris/degit
[starter repos]: https://github.com/search?l=JavaScript&q=starter+boilerplate&type=Repositories
[create-react-app]: https://github.com/facebook/create-react-app
[yeoman]: https://yeoman.io/
[next.js]: https://https://nextjs.org/
[njsi2019]:https://events19.linuxfoundation.org/events/nodejs-interactive-2019/
[njsi2019 talk]:https://njsi2019.sched.com/event/T5Fc/gasket-framework-maker-andrew-gerard-godaddy-llc
[cover-photo]: https://pixabay.com/photos/building-construction-site-cranes-768815/
