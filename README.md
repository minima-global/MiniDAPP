# MiniDapp

Minima blockchain applications.

This repo' contains simple demos and examples of what is possible with Minima using the MiniDapp system.

## MiniDapp Config' File Layout

Below is an example MiniDapp configuration file (`minidapp.conf`):

```
{
	"name":"Awesome MiniDapp",
	"version": "0.1.0",
	"headline":"An Awesome MiniDapp for doing awesome things",
	"description":"Awesome MiniDapp solves all sorts of difficult problems through awesomeness",  
	"lastKey": "0xC24CE1922768D5AD3A3B6AFE37EC3133A22D2E6A",
	"background":"./images/awesomeBackdrop.png",
	"icon":"./images/awesomeIcon.png",
	"category":"Lifestyle"
}
```

+ _name_: The MiniDapp's name,
+ _version_: The version of this MiniDapp (using [semantic versioning](https://semver.org/))
+ _headline_: A breif description of the MiniDapp
+ _description_: A more detailed description of the MiniDapp
+ _lastKey_: The currently installed MiniDapp key (displayed by the MiniHub). This will be used to support upgrading the MiniDapp - if upgrades do not need supporting, then this can be left as an empty string
+ _background_: The MiniHub background
+ _icon_: The MiniHub icon
+ _category_: The MiniDapp's category
