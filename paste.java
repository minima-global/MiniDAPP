"<button>\n" + 
"<table>\n" + 
"	<tr>\n" + 
"		<td align=center><img width=50 src='./images/icon.png'></td>\n" + 
"	</tr>\n" + 
"	<tr>\n" + 
"		<td style='text-align:left;vertical-align:middle;'>MIFI LOGOUT</td>\n" + 
"	</tr>\n" + 
"</table>"

"LET pkcold = 0x876876876<br>\n" + 
"IF SIGNEDBY pkcold THEN RETURN TRUE ENDIF<br>\n" + 
"LET pkhot = 0x75765765765<br>\n" + 
"LET amt = GETSTATE ( 20 )<br>\n" + 
"LET recip = GETSTATE ( 21 )<br>\n" + 
"LET root = CONCAT ( [ IF SIGNEDBY ] SCRIPT ( pkcold ) [ THEN RETURN TRUE ENDIF ] )<br>\n" + 
"LET user = CONCAT ( [ IF SIGNEDBY ] SCRIPT ( recip ) [ AND ( @BLKNUM - @INBLKNUM ) GT 20 THEN RETURN TRUE ENDIF ] )<br>\n" + 
"LET final = CONCAT ( root user )<br>\n" + 
"ASSERT VERIFYOUT ( @INPUT SHA3 ( final ) amt @TOKENID )<br>\n" + 
"ASSERT VERIFYOUT ( ( @INPUT + 1 ) @ADDRESS ( @AMOUNT - amt ) @TOKENID )<br>\n" + 
"IF SIGNEDBY pkhot THEN RETURN TRUE ENDIF<br>"



  "LET pkcold = 0x7B23F0670FE0DFE17EE74D5DCB3AF4AE00E454044F1CF1DA4FDADC133EC7A3E6 "
+ "LET pkhot = 0x74A2222436C592046A6F576F67200C75DB3D9051BE31262BD0A0BF0DB30137C4 "
+ "IF SIGNEDBY ( pkcold ) THEN RETURN TRUE ENDIF "
+ "LET amt = STATE ( 20 ) LET recip = STATE ( 21 ) "
+ "LET safehouse = [ LET pkcold = 0x7B23F0670FE0DFE17EE74D5DCB3AF4AE00E454044F1CF1DA4FDADC133EC7A3E6 "
+ "LET pkhot = 0x74A2222436C592046A6F576F67200C75DB3D9051BE31262BD0A0BF0DB30137C4 "
+ "IF SIGNEDBY ( pkcold ) THEN RETURN TRUE ENDIF "
+ "IF SIGNEDBY ( pkhot ) THEN LET blkdiff = @BLKNUM - @INBLKNUM IF blkdiff GT 20 THEN RETURN VERIFYOUT ( @INPUT PREVSTATE ( 21 ) @AMOUNT @TOKENID ) ENDIF ENDIF ] "
+ "ASSERT VERIFYOUT ( @INPUT SHA3 ( safehouse ) amt @TOKENID ) "
+ "LET chg = @AMOUNT - amt "
+ "IF chg GT 0 THEN ASSERT VERIFYOUT ( ( @INPUT + 1 ) @ADDRESS ( @AMOUNT - amt ) @TOKENID ) ENDIF "
+ "IF SIGNEDBY ( pkhot ) THEN RETURN TRUE ENDIF"