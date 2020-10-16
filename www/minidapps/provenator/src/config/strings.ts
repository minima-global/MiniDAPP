class App {

  static readonly appName = 'Provenator'
  static readonly title = 'Minima'
  static readonly tagline = ''
  static readonly copyright = '© Copyright 2020 Minima GmbH'
  static readonly author = '[Steve Huckle](https://glowkeeper.github.io/)'
  static readonly email = 'steve dot huckle at minima dot global'
}

class Paths {

  // AppBar
  static readonly home = 'Home'
  static readonly blockchain = 'Blockchain'
  static readonly about = 'About'
  static readonly help = 'Help'
  static readonly faq = 'FAQ'
  static readonly contact = 'Contact'

  static readonly listFiles = 'List Files'
  static readonly addFile = `Add a File`
  static readonly checkFile = `Check a File`
}


class Blockchain {

  static heading = 'Blockchain Info'
}

class GeneralError {

    static readonly required = "Required"
}

class Transaction {

    static readonly pending = "Please wait - transaction is pending"
    static readonly unnecessary = `File already on ${App.title}`
    static readonly success = "Submitted successfully"
    static readonly failure = 'Submission failure'

    static readonly errorGettingData = "Error getting data"
}

class Home {

  static readonly heading = 'Home'

  static readonly info = `**${App.appName}**`
}

class About {

  static readonly heading = 'About Provenator'

  static readonly info = `**${App.appName}** version 0.1.0<br /><br />Created by _${App.author}_`

}

class Help {

  static readonly heading = 'Provenator Help'

  static readonly info = `Use **${App.appName}** to prove the provenance of your files. Select _${Paths.addFile}_ from the _${Paths.home}_ screen to add a file **now**.`
}

class Faq {

  static readonly heading = 'FAQ'

  static readonly info = `Coming soon`
}

class Contact {

  static readonly heading = 'Contact'

  static readonly info = `${App.email}`
}

class File {

    static readonly headingAddFile = "Add a File"
    static readonly headingCheckFile = "Check a File"
    static readonly getFile = "Get File"
    static readonly checkFile = "Get a File to Check"
    static readonly noBlock = "n/a"
    static readonly fileTip = "Select a file to be hashed"
    static readonly fileName = "Filename"
    static readonly hash = "Hash"
    static readonly submitTip = "Submit the hash of the file to the Minima blockchain. The key returned is that used to sign the submitted transaction"
    static readonly loadingError = "File did not load"

    static readonly addFileButton = `Add to ${App.title}`
    static readonly checkFileButton = `Check on ${App.title}`
}

class Files {

    static readonly heading = "Files"
    static readonly listFilesInfo = "(If you just added a file, you may need to wait for its hash to be mined before it appears here)"
    static readonly hash = "Hash"
    static readonly block = "Block"
}

export { App,
         Paths,
         Blockchain,
         GeneralError,
         Transaction,
         Home,
         About,
         Help,
         Faq,
         Contact,
         File,
         Files
       }
