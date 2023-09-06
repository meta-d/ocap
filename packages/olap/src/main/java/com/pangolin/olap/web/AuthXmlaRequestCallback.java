package com.pangolin.olap.web;

import java.util.Map;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.w3c.dom.Element;

import mondrian.xmla.XmlaConstants;
import mondrian.xmla.XmlaRequestCallback;

public class AuthXmlaRequestCallback implements XmlaRequestCallback {
    private final Log LOGGER = LogFactory.getLog(AuthXmlaRequestCallback.class);

    public boolean processHttpHeader(
        HttpServletRequest request,
        HttpServletResponse response,
        Map<String, Object> context)
        throws Exception
    {
        String roleName = request.getHeader("mondrian-role");
        if (roleName != null) {
            LOGGER.debug(roleName);
            context.put(XmlaConstants.CONTEXT_ROLE_NAME, roleName);
        }
        // We do not perform any special header treatment.
        return true;
    }

    @Override
    public void init(ServletConfig servletConfig) throws ServletException {
        // TODO Auto-generated method stub
        
    }

    @Override
    public void preAction(HttpServletRequest request, Element[] requestSoapParts, Map<String, Object> context)
            throws Exception {
        // TODO Auto-generated method stub
        
    }

    @Override
    public String generateSessionId(Map<String, Object> context) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void postAction(HttpServletRequest request, HttpServletResponse response, byte[][] responseSoapParts,
            Map<String, Object> context) throws Exception {
        // TODO Auto-generated method stub
        
    }
    
}
