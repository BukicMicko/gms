package com.arkcase.gms.model.form;

import com.arkcase.gms.model.GmsConstants;
import com.armedia.acm.form.cost.model.CostForm;

import javax.xml.bind.annotation.XmlRootElement;

/**
 * Created by riste.tutureski on 12/2/2015.
 */
@XmlRootElement(name="form_" + GmsConstants.FORM_NAME_COSTSHEET_PAYMENT, namespace=GmsConstants.FORM_NAMESPACE_COSTSHEET_PAYMENT)
public class CostPaymentForm extends CostForm
{
}
