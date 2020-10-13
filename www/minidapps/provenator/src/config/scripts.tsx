
class Scripts {

    static readonly fileContract  = "LET owner = STATE ( 0 ) LET address = STATE ( 1 ) LET file = STATE ( 2 ) RETURN VERIFYOUT ( @INPUT owner address file )"

}

export { Scripts }
